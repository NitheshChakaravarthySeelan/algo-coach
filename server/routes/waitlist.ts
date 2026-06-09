import { Hono } from 'hono'
import { db } from '../db'
import { waitlistEntry } from '../db/schema'
import { waitlistSchema } from '../lib/validation'
import { z } from 'zod'

const waitlist = new Hono()

waitlist.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = waitlistSchema.parse(body)

    const entry = {
      id: crypto.randomUUID(),
      name: parsed.name,
      email: parsed.email,
      leetcodeUsername: parsed.leetcodeUsername ?? null,
      experience: parsed.experience,
      struggles: parsed.struggles ? JSON.stringify(parsed.struggles) : null,
      desiredFeature: parsed.desiredFeature ?? null,
      goals: parsed.goals ? JSON.stringify(parsed.goals) : null,
      userId: null,
      createdAt: new Date(),
    }

    await db.insert(waitlistEntry).values(entry)

    return c.json({ success: true, data: { ...entry, struggles: parsed.struggles, goals: parsed.goals } }, 201)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return c.json({ success: false, errors: err.issues }, 400)
    }
    return c.json({ success: false, error: err.message || 'Validation failed' }, 400)
  }
})

waitlist.get('/', async (c) => {
  const entries = await db.select().from(waitlistEntry)
  const parsed = entries.map((e: typeof waitlistEntry.$inferSelect) => ({
    ...e,
    struggles: e.struggles ? JSON.parse(e.struggles) : [],
    goals: e.goals ? JSON.parse(e.goals) : [],
  }))
  return c.json({ success: true, data: parsed })
})

export default waitlist
