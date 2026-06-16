import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { db } from '../db'
import { userPreferences, roadmapPlan, dailyPlan, dailyProgress } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { eq, and, gte, desc, lte, inArray } from 'drizzle-orm'
import { selectDailyProblems } from '../services/ai'
import { createProvider, extractJson } from '../services/ai-provider'
import { searchLeetCodeProblems } from '../services/leetcode-search'

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
    return c.json({ success: true, data: { ...plan, ready: weeks.length > 0 } })
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

    if (plan.currentWeek >= weeks.length) {
      return c.json({ success: false, error: 'Roadmap already completed' }, 400)
    }

    const nextWeek = plan.currentWeek + 1
    await db.update(roadmapPlan).set({
      currentWeek: nextWeek,
      updatedAt: new Date(),
    }).where(eq(roadmapPlan.userId, userId))

    const updated = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    return c.json({ success: true, data: { ...updated, ready: true } })
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

  return streamSSE(c, async (stream) => {
    const prompt = `You are a LeetCode coach creating a personalized study roadmap.

User Profile:
- Experience: ${prefs.experienceLevel}
- Goals: ${prefs.goals.join(", ")}
- Weak topics: ${prefs.weakTopics.join(", ")}
- Target companies: ${prefs.targetCompanies?.join(", ") || "Not specified"}
- Hours per week: ${prefs.hoursPerWeek}
- Target date: ${prefs.targetDate || "No deadline"}

Create a structured weekly roadmap that:
1. Starts with fundamentals and progresses to advanced topics
2. Prioritizes the user's weak topics
3. Allocates more weeks to harder topics
4. Is realistic given their hours per week

Return a JSON array where each entry has: week (number), topic (string), description (string), problemsCount (number).

IMPORTANT: Each topic MUST be a valid LeetCode problem tag name (e.g., "Arrays", "Strings", "Hash Table", "Dynamic Programming", "Linked List", "Binary Search", "Trees", "Graph", "Heap", "Backtracking", "Sliding Window", "Two Pointers", "Stack", "Queue", "Math", "Sorting", "Greedy", "Recursion", "Bit Manipulation"). Use STANDARD LeetCode tag names only, separated by commas if combining topics. EXAMPLE: "Binary Search, Bit Manipulation" not "Binary Search & Bit Manipulation".

Aim for 4-12 weeks total depending on the user's experience and goals.`

    const provider = createProvider()
    let fullText = ""

    try {
      for await (const chunk of provider.generateStream({ prompt, temperature: 0.7 })) {
        fullText += chunk
        await stream.writeSSE({ data: JSON.stringify({ type: "token", text: chunk }) })
      }

      const cleaned = extractJson(fullText)
      let parsed: any
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "Failed to parse roadmap from AI response" }) })
        return
      }

      const weeks = Array.isArray(parsed) ? parsed : parsed.weeks || parsed.roadmap || []

      await db.update(roadmapPlan).set({
        weeks: JSON.parse(JSON.stringify(weeks)),
        currentWeek: 1,
        updatedAt: new Date(),
      }).where(eq(roadmapPlan.userId, userId))

      const updated = await db.query.roadmapPlan.findFirst({
        where: eq(roadmapPlan.userId, userId),
      })

      await stream.writeSSE({ data: JSON.stringify({ type: "done", data: { ...updated, ready: true } }) })
    } catch (err: any) {
      const msg = err.message || ""
      let inner: string
      try { inner = JSON.parse(JSON.parse(msg).error?.message || msg).error?.message || msg } catch { inner = msg }
      if (inner.includes("API_KEY") || inner.includes("API key")) {
        await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "Invalid or missing AI API key. Check your GEMINI_API_KEY or GROQ_API_KEY." }) })
      } else if (inner.includes("429") || inner.includes("quota") || inner.includes("Too Many Requests") || inner.includes("RATE_LIMIT")) {
        await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "AI quota reached. Please try again in a minute.", retryAfter: 60 }) })
      } else if (inner.includes("500") || inner.includes("INTERNAL") || inner.includes("Internal error")) {
        await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "AI provider returned an error. The model may be unavailable. Try setting AI_PROVIDER=groq or a different AI_MODEL." }) })
      } else {
        await stream.writeSSE({ data: JSON.stringify({ type: "error", message: inner }) })
      }
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
        percent: total > 0 ? Math.round((solved / total) * 100) : 0,
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const plan = await db.query.dailyPlan.findFirst({
      where: and(
        eq(dailyPlan.userId, userId),
        gte(dailyPlan.date, today),
        gte(tomorrow, dailyPlan.date),
      ),
    })
    if (!plan) return c.json({ success: false, exists: false }, 404)
    return c.json({ success: true, exists: true, data: plan })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.post('/today', async (c) => {
  try {
    const userId = c.get('userId')
    const body: any = await c.req.json().catch(() => ({}))
    const difficultyFilter = (body.difficulty || "MIXED") as "EASY" | "MEDIUM" | "HARD" | "MIXED"

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await db.query.dailyPlan.findFirst({
      where: and(
        eq(dailyPlan.userId, userId),
        gte(dailyPlan.date, today),
        gte(tomorrow, dailyPlan.date),
      ),
    })
    if (existing) return c.json({ success: true, data: existing, exists: true }, 200)

    const planRecord = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!planRecord) return c.json({ success: false, error: 'No roadmap found. Complete onboarding first.' }, 400)

    const roadmap = Array.isArray(planRecord.weeks) ? planRecord.weeks : []
    if (roadmap.length === 0) return c.json({ success: false, error: 'Roadmap is still being generated. Please try again shortly.' }, 400)
    const currentWeek = planRecord.currentWeek

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
      problems: JSON.parse(JSON.stringify(problems)),
    }

    await db.insert(dailyPlan).values(entry)

    return c.json({ success: true, data: { ...entry, explanation: task.explanation } }, 201)
  } catch (err: any) {
    return c.json({ success: false, error: `Failed to generate daily plan: ${err.message}` }, 500)
  }
})

app.patch('/today/:planId/problem/:slug', async (c) => {
  try {
    const userId = c.get('userId')
    const { planId, slug } = c.req.param()
    const body: any = await c.req.json()
    const status = body.status as string
    if (!["SOLVED", "TRIED", "SKIPPED", "PENDING"].includes(status)) {
      return c.json({ success: false, error: 'Invalid status. Use SOLVED, TRIED, SKIPPED, or PENDING.' }, 400)
    }

    const plan = await db.query.dailyPlan.findFirst({
      where: and(eq(dailyPlan.id, planId), eq(dailyPlan.userId, userId)),
    })
    if (!plan) return c.json({ success: false, error: 'Plan not found' }, 404)

    const problems = Array.isArray(plan.problems) ? [...plan.problems] : []
    const idx = problems.findIndex((p: any) => (p as Record<string, unknown>).titleSlug === slug)
    if (idx === -1) return c.json({ success: false, error: 'Problem not found in this plan' }, 404)

    const problem = { ...(problems[idx] as Record<string, unknown>) }
    problem.status = status
    problem.completedAt = status === "SOLVED" ? new Date().toISOString() : null
    problems[idx] = problem

    await db.update(dailyPlan)
      .set({ problems: JSON.parse(JSON.stringify(problems)) })
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
    const slot = body.slot as number | undefined
    const easier = body.easier === true

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
        currentWeek: plan.weekNumber,
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
        currentWeek: plan.weekNumber,
        progress: progress.map((p) => ({ problemId: p.problemId, status: p.status })),
        dedupCount,
        solvedSlugs,
        count: existingProblems.length,
        difficultyFilter: "MIXED",
        excludeSlugs: [],
      })
      const newProblems = result.problems.map((p) => ({ ...p, status: "PENDING", completedAt: null }))
      existingProblems.length = 0
      existingProblems.push(...newProblems)
    }

    await db.update(dailyPlan)
      .set({ problems: JSON.parse(JSON.stringify(existingProblems)) })
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

    if (!plans.length) {
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
        const diffMs = curr.getTime() - prev.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
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
