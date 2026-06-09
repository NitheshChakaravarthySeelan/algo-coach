import { Hono } from 'hono'
import { db } from '../db'
import { surveyResponse } from '../db/schema'
import { surveySchema } from '../lib/validation'
import { z } from 'zod'

const survey = new Hono()

survey.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = surveySchema.parse(body)

    const entry = {
      id: crypto.randomUUID(),
      email: parsed.email,
      struggles: JSON.stringify(parsed.struggles),
      desiredFeature: parsed.desiredFeature,
      goals: JSON.stringify(parsed.goals),
      createdAt: new Date(),
    }

    await db.insert(surveyResponse).values(entry)

    return c.json({ success: true, data: entry }, 201)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return c.json({ success: false, errors: err.issues }, 400)
    }
    return c.json({ success: false, error: err.message || 'Validation failed' }, 400)
  }
})

survey.get('/', async (c) => {
  const entries = await db.select().from(surveyResponse)
  const parsed = entries.map((e: typeof surveyResponse.$inferSelect) => ({
    ...e,
    struggles: JSON.parse(e.struggles),
    goals: JSON.parse(e.goals),
  }))
  return c.json({ success: true, data: parsed })
})

export default survey
