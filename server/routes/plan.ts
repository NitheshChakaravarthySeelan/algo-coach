import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import { db } from '../db'
import { userPreferences, roadmapPlan, dailyPlan, dailyProgress, roadmapJob } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { eq, and, desc, sql } from 'drizzle-orm'
import { selectDailyProblems, startJobProcessing } from '../services/ai'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function getCurrentWeek(userId: string, weeks: any[]): Promise<number> {
  if (!weeks.length) return 1
  const solved = await db.query.dailyProgress.findMany({
    where: and(eq(dailyProgress.userId, userId), eq(dailyProgress.status, 'SOLVED')),
  })
  const solvedDays = new Set(solved.map(r => r.date.toISOString().slice(0, 10))).size
  let week = Math.floor(solvedDays / 7) + 1
  if (week > weeks.length) week = weeks.length
  return week
}

const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'MIXED'])
const planStatusSchema = z.enum(['SOLVED', 'TRIED', 'SKIPPED', 'PENDING'])
const regenerateBodySchema = z.object({
  slot: z.number().int().min(0).optional(),
  easier: z.boolean().optional(),
})

function tryParseError(msg: string): string {
  try {
    const top = JSON.parse(msg)
    const inner = top.error?.message || top.message || msg
    if (typeof inner === 'string') {
      try {
        return JSON.parse(inner).error?.message || inner
      } catch {
        return inner
      }
    }
    return String(inner)
  } catch {
    return msg
  }
}

const app = new Hono<{ Variables: { userId: string } }>()
app.use('/*', authMiddleware)

app.get('/roadmap', async (c) => {
  try {
    const userId = c.get('userId')
    const plan = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!plan) return c.json({ success: false, error: 'No roadmap found' }, 404)
    const weeks = Array.isArray(plan.weeks) ? plan.weeks : []
    const currentWeek = await getCurrentWeek(userId, weeks)
    return c.json({ success: true, data: { ...plan, currentWeek, ready: weeks.length > 0 } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.patch('/roadmap/advance', async (c) => {
  try {
    const userId = c.get('userId')
    const plan = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!plan) return c.json({ success: false, error: 'No roadmap found' }, 404)

    const weeks = Array.isArray(plan.weeks) ? plan.weeks : []
    if (!weeks.length) return c.json({ success: false, error: 'Roadmap not ready' }, 400)

    const currentWeek = await getCurrentWeek(userId, weeks)
    if (currentWeek >= weeks.length) {
      return c.json({ success: false, error: 'Roadmap already completed' }, 400)
    }

    return c.json({ success: true, data: { ...plan, currentWeek, ready: true } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.post('/roadmap/generate', async (c) => {
  const userId = c.get('userId')

  const planRecord = await db.query.roadmapPlan.findFirst({
    where: eq(roadmapPlan.userId, userId),
  })
  if (!planRecord) {
    return c.json({ success: false, error: 'Complete onboarding first' }, 400)
  }

  const force = c.req.query('force') === 'true'
  const existingWeeks = Array.isArray(planRecord.weeks) ? planRecord.weeks : []
  if (existingWeeks.length > 0 && !force) {
    return c.json({ success: true, data: { ...planRecord, ready: true } })
  }

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  })
  if (!prefs) {
    return c.json({ success: false, error: 'Complete onboarding first' }, 400)
  }

  const jobId = crypto.randomUUID()
  await db.insert(roadmapJob).values({
    id: jobId,
    userId,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  startJobProcessing(jobId)

  return c.json({ success: true, data: { jobId } })
})

app.get('/roadmap/jobs/:jobId', async (c) => {
  const userId = c.get('userId')
  const { jobId } = c.req.param()

  const job = await db.query.roadmapJob.findFirst({
    where: and(eq(roadmapJob.id, jobId), eq(roadmapJob.userId, userId)),
  })
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404)

  return c.json({ success: true, data: job })
})

app.post('/roadmap/jobs/:jobId/stream', async (c) => {
  const userId = c.get('userId')
  const { jobId } = c.req.param()

  const job = await db.query.roadmapJob.findFirst({
    where: and(eq(roadmapJob.id, jobId), eq(roadmapJob.userId, userId)),
  })
  if (!job) return c.json({ success: false, error: 'Job not found' }, 404)

  if (job.status === "pending") {
    startJobProcessing(jobId)
  }

  return streamSSE(c, async (stream) => {
    let lastProgress = job.progress || ""
    let lastStatus = job.status

    if (lastProgress) {
      await stream.writeSSE({ data: JSON.stringify({ type: "token", text: lastProgress }) })
    }

    const pollStart = Date.now()
    const MAX_POLL_MS = 180_000

    while (lastStatus === "pending" || lastStatus === "processing") {
      if (Date.now() - pollStart > MAX_POLL_MS) {
        await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "Generation timed out. Please try again." }) })
        return
      }
      await sleep(500)

      const current = await db.query.roadmapJob.findFirst({
        where: and(eq(roadmapJob.id, jobId), eq(roadmapJob.userId, userId)),
      })
      if (!current) break

      const newProgress = current.progress || ""
      if (newProgress.length > lastProgress.length && newProgress.startsWith(lastProgress)) {
        const delta = newProgress.slice(lastProgress.length)
        lastProgress = newProgress
        await stream.writeSSE({ data: JSON.stringify({ type: "token", text: delta }) })
      } else if (newProgress !== lastProgress) {
        lastProgress = newProgress
        await stream.writeSSE({ data: JSON.stringify({ type: "token", text: newProgress }) })
      }

      lastStatus = current.status
      if (lastStatus === "done") {
        const planRecord = await db.query.roadmapPlan.findFirst({
          where: eq(roadmapPlan.userId, userId),
        })
        await stream.writeSSE({ data: JSON.stringify({ type: "done", data: { ...planRecord, ready: true } }) })
        return
      }
      if (lastStatus === "error") {
        const msg = current.error || "Unknown error"
        const parsed = tryParseError(msg)
        if (parsed.includes("API_KEY") || parsed.includes("API key")) {
          await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "Invalid or missing AI API key. Check your GEMINI_API_KEY, GROQ_API_KEY, or NVIDIA_API_KEY." }) })
        } else if (parsed.includes("429") || parsed.includes("quota") || parsed.includes("Too Many Requests") || parsed.includes("RATE_LIMIT")) {
          await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "AI quota reached. Please try again in a minute.", retryAfter: 60 }) })
        } else if (parsed.includes("500") || parsed.includes("INTERNAL") || parsed.includes("Internal error") || parsed.includes("internalError") || parsed.includes("internalServerError")) {
          await stream.writeSSE({ data: JSON.stringify({ type: "error", message: `AI provider returned an error: ${parsed}. The model may be unavailable. Try setting AI_PROVIDER=groq, AI_PROVIDER=nvidia, or a different AI_MODEL.` }) })
        } else {
          await stream.writeSSE({ data: JSON.stringify({ type: "error", message: parsed }) })
        }
        return
      }
    }

    if (lastStatus === "done") {
      const planRecord = await db.query.roadmapPlan.findFirst({
        where: eq(roadmapPlan.userId, userId),
      })
      await stream.writeSSE({ data: JSON.stringify({ type: "done", data: { ...planRecord, ready: true } }) })
    }
  })
})

app.get('/roadmap/progress', async (c) => {
  try {
    const userId = c.get('userId')

    const plan = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!plan) return c.json({ success: false, error: 'No roadmap found' }, 404)

    const weeks = Array.isArray(plan.weeks) ? plan.weeks : []
    if (!weeks.length) return c.json({ success: false, error: 'Roadmap not ready' }, 400)

    const allPlans = await db.query.dailyPlan.findMany({
      where: eq(dailyPlan.userId, userId),
    })

    const progress = weeks.map((w: any) => {
      const weekPlans = allPlans.filter((p: any) => p.weekNumber === w.week)
      const solved = weekPlans.reduce((count: number, plan: any) => {
        const problems = Array.isArray(plan.problems) ? plan.problems : []
        return count + problems.filter((p: any) => (p as Record<string, unknown>).status === "SOLVED").length
      }, 0)
      const total = weekPlans.reduce((count: number, plan: any) => {
        const problems = Array.isArray(plan.problems) ? plan.problems : []
        return count + problems.length
      }, 0)
      return {
        week: w.week,
        topic: w.topic,
        targetCount: w.problemsCount,
        assignedCount: total,
        solvedCount: solved,
        percent: w.problemsCount > 0 ? Math.round((solved / w.problemsCount) * 100) : 0,
      }
    })

    return c.json({ success: true, data: progress })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.get('/today', async (c) => {
  try {
    const userId = c.get('userId')
    const todayMs = Date.now() - (Date.now() % 86400000)
    const tomorrowMs = todayMs + 86400000

    const plan = await db.query.dailyPlan.findFirst({
      where: and(
        eq(dailyPlan.userId, userId),
        sql`${dailyPlan.date} >= ${todayMs}`,
        sql`${dailyPlan.date} < ${tomorrowMs}`,
      ),
    })
    if (!plan) return c.json({ success: false, exists: false }, 404)

    const planRecord = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    const weeks = Array.isArray(planRecord?.weeks) ? planRecord.weeks : []
    const currentWeek = await getCurrentWeek(userId, weeks)
    const topic = weeks[currentWeek - 1] ? (weeks[currentWeek - 1] as Record<string, unknown>)?.topic as string : plan.topic

    return c.json({ success: true, exists: true, data: { ...plan, weekNumber: currentWeek, topic } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.post('/today', async (c) => {
  try {
    const userId = c.get('userId')
    const body: any = await c.req.json().catch(() => ({}))
    const diffResult = difficultySchema.safeParse(body.difficulty)
    const difficultyFilter = diffResult.success ? diffResult.data : 'MIXED'

    const todayMs = Date.now() - (Date.now() % 86400000)
    const tomorrowMs = todayMs + 86400000

    const existing = await db.query.dailyPlan.findFirst({
      where: and(
        eq(dailyPlan.userId, userId),
        sql`${dailyPlan.date} >= ${todayMs}`,
        sql`${dailyPlan.date} < ${tomorrowMs}`,
      ),
    })
    if (existing) return c.json({ success: true, data: existing, exists: true }, 200)

    const planRecord = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!planRecord) return c.json({ success: false, error: 'No roadmap found. Complete onboarding first.' }, 400)

    const roadmap = Array.isArray(planRecord.weeks) ? planRecord.weeks : []
    if (roadmap.length === 0) return c.json({ success: false, error: 'Roadmap is still being generated. Please try again shortly.' }, 400)
    const currentWeek = await getCurrentWeek(userId, roadmap)
    if (currentWeek > roadmap.length) {
      return c.json({ success: false, error: 'Roadmap is complete. Generate a new roadmap to continue.' }, 400)
    }

    const allPlans = await db.query.dailyPlan.findMany({
      where: eq(dailyPlan.userId, userId),
    })

    const dedupCount: Record<string, number> = {}
    for (const plan of allPlans) {
      const problems = Array.isArray(plan.problems) ? plan.problems : []
      for (const p of problems) {
        const slug = (p as Record<string, unknown>).titleSlug as string
        if (slug) dedupCount[slug] = (dedupCount[slug] || 0) + 1
      }
    }

    const progress = await db.query.dailyProgress.findMany({
      where: eq(dailyProgress.userId, userId),
    })
    const solvedSlugs = progress
      .filter((p) => p.status === 'SOLVED')
      .map((p) => p.problemId)

    const task = await selectDailyProblems({
      roadmap,
      currentWeek,
      progress: progress.map((p) => ({ problemId: p.problemId, status: p.status })),
      dedupCount,
      solvedSlugs,
      difficultyFilter,
    })

    const problems = task.problems.map((p) => ({
      ...p,
      status: "PENDING",
      completedAt: null,
    }))

    const entry = {
      id: crypto.randomUUID(),
      userId,
      date: new Date(),
      weekNumber: currentWeek,
      topic: (roadmap[currentWeek - 1] as Record<string, unknown>)?.topic as string || '',
      problems,
      explanation: task.explanation,
    }

    await db.insert(dailyPlan).values(entry)

    return c.json({ success: true, data: entry }, 201)
  } catch (err: any) {
    return c.json({ success: false, error: `Failed to generate daily plan: ${err.message}` }, 500)
  }
})

app.patch('/today/:planId/problem/:slug', async (c) => {
  try {
    const userId = c.get('userId')
    const { planId, slug } = c.req.param()
    const body: any = await c.req.json()
    const statusResult = planStatusSchema.safeParse(body.status)
    if (!statusResult.success) {
      return c.json({ success: false, error: 'Invalid status. Use SOLVED, TRIED, SKIPPED, or PENDING.' }, 400)
    }
    const status = statusResult.data

    const plan = await db.query.dailyPlan.findFirst({
      where: and(eq(dailyPlan.id, planId), eq(dailyPlan.userId, userId)),
    })
    if (!plan) return c.json({ success: false, error: 'Plan not found' }, 404)

    const problems = Array.isArray(plan.problems) ? [...plan.problems] : []
    const idx = problems.findIndex((p: any) => (p as Record<string, unknown>).titleSlug === slug)
    if (idx === -1) return c.json({ success: false, error: 'Problem not found in this plan' }, 404)

    const problem = { ...problems[idx], status, completedAt: status === "SOLVED" ? new Date().toISOString() : null }
    problems[idx] = problem

    await db.update(dailyPlan)
      .set({ problems })
      .where(eq(dailyPlan.id, planId))

    const existingProgress = await db.query.dailyProgress.findFirst({
      where: and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.problemId, slug),
      ),
    })

    if (existingProgress) {
      await db.update(dailyProgress)
        .set({ status, date: new Date() })
        .where(eq(dailyProgress.id, existingProgress.id))
    } else {
      await db.insert(dailyProgress).values({
        id: crypto.randomUUID(),
        userId,
        date: new Date(),
        problemName: problem.title as string,
        difficulty: problem.difficulty as string,
        problemId: slug,
        topics: (problem.topicTags as string[]) || [],
        status,
      })
    }

    return c.json({ success: true, data: { ...problem, status, completedAt: problem.completedAt } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.post('/today/:planId/regenerate', async (c) => {
  try {
    const userId = c.get('userId')
    const { planId } = c.req.param()
    const body: any = await c.req.json().catch(() => ({}))
    const regenResult = regenerateBodySchema.safeParse(body)
    const slot = regenResult.success ? regenResult.data.slot : undefined
    const easier = regenResult.success ? regenResult.data.easier === true : false

    const plan = await db.query.dailyPlan.findFirst({
      where: and(eq(dailyPlan.id, planId), eq(dailyPlan.userId, userId)),
    })
    if (!plan) return c.json({ success: false, error: 'Plan not found' }, 404)

    const existingProblems = Array.isArray(plan.problems) ? [...plan.problems] : []

    if (slot !== undefined) {
      if (slot < 0 || slot >= existingProblems.length) {
        return c.json({ success: false, error: `Invalid slot. Must be 0-${existingProblems.length - 1}` }, 400)
      }
    }

    const planRecord = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    const roadmap = Array.isArray(planRecord?.weeks) ? planRecord.weeks : []
    const currentWeek = await getCurrentWeek(userId, roadmap)

    const allPlans = await db.query.dailyPlan.findMany({
      where: eq(dailyPlan.userId, userId),
    })
    const dedupCount: Record<string, number> = {}
    for (const p of allPlans) {
      const probs = Array.isArray(p.problems) ? p.problems : []
      for (const prob of probs) {
        const slug = (prob as Record<string, unknown>).titleSlug as string
        if (slug) dedupCount[slug] = (dedupCount[slug] || 0) + 1
      }
    }
    const progress = await db.query.dailyProgress.findMany({
      where: eq(dailyProgress.userId, userId),
    })
    const solvedSlugs = progress.filter((p) => p.status === 'SOLVED').map((p) => p.problemId)

    const currentPlanSlugs = existingProblems.map((p: any) => (p as Record<string, unknown>).titleSlug as string)

    if (slot !== undefined) {
      const replaced = existingProblems[slot] as Record<string, unknown>
      let diffFilter: "EASY" | "MEDIUM" | "HARD" | "MIXED" = "MIXED"
      if (easier) {
        const curDiff = (replaced.difficulty as string) || "MEDIUM"
        diffFilter = curDiff === "HARD" ? "MEDIUM" : curDiff === "MEDIUM" ? "EASY" : "EASY"
      }
      const result = await selectDailyProblems({
        roadmap,
        currentWeek,
        progress: progress.map((p) => ({ problemId: p.problemId, status: p.status })),
        dedupCount,
        solvedSlugs,
        count: 1,
        difficultyFilter: diffFilter,
        excludeSlugs: currentPlanSlugs,
      })
      const newProblem = result.problems[0]
      if (!newProblem) {
        return c.json({ success: false, error: 'No alternative problem found to replace this slot.' }, 400)
      }
      existingProblems[slot] = { ...newProblem, status: "PENDING", completedAt: null }
    } else {
      const result = await selectDailyProblems({
        roadmap,
        currentWeek,
        progress: progress.map((p) => ({ problemId: p.problemId, status: p.status })),
        dedupCount,
        solvedSlugs,
        count: 3,
        difficultyFilter: "MIXED",
        excludeSlugs: currentPlanSlugs,
      })
      if (!result.problems.length) {
        return c.json({ success: false, error: 'No alternative problems found. Try a different topic or adjust your difficulty filter.' }, 400)
      }
      const newProblems = result.problems.map((p) => ({ ...p, status: "PENDING", completedAt: null }))
      existingProblems.length = 0
      existingProblems.push(...newProblems)
    }

    await db.update(dailyPlan)
      .set({ problems: existingProblems })
      .where(eq(dailyPlan.id, planId))

    return c.json({ success: true, data: { ...plan, problems: existingProblems } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.get('/streak', async (c) => {
  try {
    const userId = c.get('userId')

    const plans = await db.query.dailyPlan.findMany({
      where: eq(dailyPlan.userId, userId),
      orderBy: [desc(dailyPlan.date)],
    })

    const progressRecords = await db.query.dailyProgress.findMany({
      where: and(eq(dailyProgress.userId, userId), eq(dailyProgress.status, 'SOLVED')),
    })

    if (!plans.length && !progressRecords.length) {
      return c.json({ success: true, data: { currentStreak: 0, longestStreak: 0, solvedToday: false } })
    }

    const solvedDates = new Set<string>()
    const allDates = new Set<string>()

    for (const plan of plans) {
      const d = new Date(plan.date)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      allDates.add(dateStr)
      const problems = Array.isArray(plan.problems) ? plan.problems : []
      const hasSolved = problems.some((p: any) => (p as Record<string, unknown>).status === "SOLVED")
      if (hasSolved) solvedDates.add(dateStr)
    }

    for (const r of progressRecords) {
      const d = new Date(r.date)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      solvedDates.add(dateStr)
      allDates.add(dateStr)
    }

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    const solvedToday = solvedDates.has(todayStr)

    let currentStreak = 0
    const d = new Date()
    if (!solvedToday) d.setDate(d.getDate() - 1)

    while (true) {
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (solvedDates.has(ds)) {
        currentStreak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    let longestStreak = currentStreak
    let tempStreak = 0
    const sortedDates = [...solvedDates].sort()
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prev = new Date(sortedDates[i - 1])
        const curr = new Date(sortedDates[i])
        const diffMs = Date.UTC(curr.getFullYear(), curr.getMonth(), curr.getDate()) - Date.UTC(prev.getFullYear(), prev.getMonth(), prev.getDate())
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    return c.json({
      success: true,
      data: { currentStreak, longestStreak, solvedToday },
    })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.get('/history', async (c) => {
  try {
    const userId = c.get('userId')
    const plans = await db.query.dailyPlan.findMany({
      where: eq(dailyPlan.userId, userId),
      orderBy: [desc(dailyPlan.date)],
    })

    const history = plans.flatMap((p) => {
      const problems = Array.isArray(p.problems) ? p.problems : []
      return problems
        .filter((prob: any) => (prob as Record<string, unknown>).status === "SOLVED")
        .map((prob: any) => ({
          ...(prob as Record<string, unknown>),
          solvedDate: p.date,
          weekNumber: p.weekNumber,
          planId: p.id,
        }))
    })

    return c.json({ success: true, data: history })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

export default app
