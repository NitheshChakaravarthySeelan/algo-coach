import { Hono } from 'hono'
import { db } from '../db'
import { roadmapPlan, dailyPlan, dailyProgress } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { eq, and, gte, desc } from 'drizzle-orm'
import { generateDailyTask } from '../services/ai'

const app = new Hono<{ Variables: { userId: string } }>()
app.use('/*', authMiddleware)

app.get('/roadmap', async (c) => {
  try {
    const userId = c.get('userId')
    const plan = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!plan) return c.json({ success: false, error: 'No roadmap found' }, 404)
    return c.json({ success: true, data: plan })
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

    const planRecord = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })
    if (!planRecord) return c.json({ success: false, error: 'No roadmap found. Complete onboarding first.' }, 400)

    const roadmap = Array.isArray(planRecord.weeks) ? planRecord.weeks : []
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

    const task = await generateDailyTask({
      roadmap,
      currentWeek,
      progress: progress.map((p) => ({ problemId: p.problemId, status: p.status })),
      dedupCount,
      solvedSlugs,
    })

    const entry = {
      id: crypto.randomUUID(),
      userId,
      date: new Date(),
      weekNumber: currentWeek,
      topic: (roadmap[currentWeek - 1] as Record<string, unknown>)?.topic as string || '',
      problems: JSON.parse(JSON.stringify(task.problems)),
    }

    await db.insert(dailyPlan).values(entry)
    await db.update(roadmapPlan).set({ updatedAt: new Date() }).where(eq(roadmapPlan.userId, userId))

    return c.json({ success: true, data: { ...entry, explanation: task.explanation } }, 201)
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to generate daily plan' }, 500)
  }
})

export default app
