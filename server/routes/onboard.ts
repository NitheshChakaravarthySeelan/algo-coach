import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { userPreferences, roadmapPlan } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { eq } from 'drizzle-orm'
import { generateRoadmap } from '../services/ai'

const app = new Hono<{ Variables: { userId: string } }>()
app.use('/*', authMiddleware)

const onboardSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'competitive']),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  weakTopics: z.array(z.string()).min(1, 'Select at least one weak topic'),
  targetCompanies: z.array(z.string()).optional(),
  hoursPerWeek: z.number().int().min(1).max(168),
  targetDate: z.string().optional(),
})

app.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    })
    if (!prefs) return c.json({ success: false, onboarded: false }, 404)
    return c.json({ success: true, onboarded: true, data: prefs })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

app.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const parsed = onboardSchema.parse(body)

    const prefs = {
      userId,
      experienceLevel: parsed.experienceLevel,
      goals: parsed.goals,
      weakTopics: parsed.weakTopics,
      targetCompanies: parsed.targetCompanies || [],
      hoursPerWeek: parsed.hoursPerWeek,
      targetDate: parsed.targetDate ? new Date(parsed.targetDate) : null,
    }

    await db.insert(userPreferences).values(prefs).onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...prefs, updatedAt: new Date() },
    })

    const existingPlan = await db.query.roadmapPlan.findFirst({
      where: eq(roadmapPlan.userId, userId),
    })

    if (!existingPlan) {
      await db.insert(roadmapPlan).values({
        id: crypto.randomUUID(),
        userId,
        weeks: [],
        currentWeek: 1,
      })
    }

    return c.json({ success: true, data: { roadmap: existingPlan?.weeks || null } }, 201)
  } catch (err: any) {
    if (err instanceof z.ZodError) return c.json({ success: false, errors: err.issues }, 400)
    return c.json({ success: false, error: err.message || 'Failed to save preferences' }, 500)
  }
})

export default app
