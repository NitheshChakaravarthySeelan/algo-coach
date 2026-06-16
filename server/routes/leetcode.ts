import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { leetcodeAccount, dailyProgress } from '../db/schema'
import { fetchLeetcodeStats } from '../services/leetcode'
import { linkLeetcodeSchema, logProblemSchema } from '../lib/validation'
import { authMiddleware } from '../middleware/auth'
import { eq, and, desc } from 'drizzle-orm'

const app = new Hono<{ Variables: { userId: string } }>()
app.use('/*', authMiddleware)

app.post('/link', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const parsed = linkLeetcodeSchema.parse(body)

    const stats = await fetchLeetcodeStats(parsed.leetcodeUsername)

    const existing = await db.query.leetcodeAccount.findFirst({
      where: eq(leetcodeAccount.userId, userId),
    })

    const entry = {
      leetcodeUsername: stats.username,
      totalSolved: stats.totalSolved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      updatedAt: new Date(),
    }

    if (existing) {
      await db.update(leetcodeAccount).set(entry).where(eq(leetcodeAccount.userId, userId))
    } else {
      await db.insert(leetcodeAccount).values({ id: crypto.randomUUID(), userId, ...entry })
    }

    return c.json({ success: true, data: { ...entry, lastFetchedAt: new Date().toISOString() } })
  } catch (err: any) {
    if (err instanceof z.ZodError) return c.json({ success: false, errors: err.issues }, 400)
    return c.json({ success: false, error: err.message || 'Failed to link account' }, 400)
  }
})

app.get('/stats', async (c) => {
  try {
    const userId = c.get('userId')

    const account = await db.query.leetcodeAccount.findFirst({
      where: eq(leetcodeAccount.userId, userId),
    })

    if (!account) return c.json({ success: false, error: 'No LeetCode account linked' }, 404)

    const stale = !account.updatedAt || Date.now() - new Date(account.updatedAt).getTime() > 3_600_000

    if (stale) {
      try {
        const stats = await fetchLeetcodeStats(account.leetcodeUsername)
        await db.update(leetcodeAccount).set({
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          updatedAt: new Date(),
        }).where(eq(leetcodeAccount.userId, userId))
        return c.json({ success: true, data: { ...account, ...stats, updatedAt: new Date().toISOString() } })
      } catch {
        return c.json({ success: true, data: account })
      }
    }

    return c.json({ success: true, data: account })
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch stats' }, 500)
  }
})

app.post('/refresh', async (c) => {
  try {
    const userId = c.get('userId')

    const account = await db.query.leetcodeAccount.findFirst({
      where: eq(leetcodeAccount.userId, userId),
    })

    if (!account) return c.json({ success: false, error: 'No LeetCode account linked' }, 404)

    const stats = await fetchLeetcodeStats(account.leetcodeUsername)

    await db.update(leetcodeAccount).set({
      totalSolved: stats.totalSolved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      updatedAt: new Date(),
    }).where(eq(leetcodeAccount.userId, userId))

    return c.json({ success: true, data: { ...stats, lastFetchedAt: new Date().toISOString() } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to refresh stats' }, 500)
  }
})

app.post('/log', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const parsed = logProblemSchema.parse(body)

    const existing = await db.query.dailyProgress.findFirst({
      where: and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.problemId, parsed.problemId),
      ),
    })

    if (existing) {
      return c.json({ success: true, data: existing })
    }

    const entry = {
      id: crypto.randomUUID(),
      userId,
      date: new Date(),
      problemName: parsed.problemName,
      difficulty: parsed.difficulty,
      problemId: parsed.problemId,
      topics: parsed.topics,
      status: 'IN_PROGRESS' as const,
    }

    await db.insert(dailyProgress).values(entry)

    return c.json({ success: true, data: entry }, 201)
  } catch (err: any) {
    if (err instanceof z.ZodError) return c.json({ success: false, errors: err.issues }, 400)
    return c.json({ success: false, error: err.message || 'Failed to log problem' }, 500)
  }
})

app.patch('/log/:problemId', async (c) => {
  try {
    const userId = c.get('userId')
    const problemId = c.req.param('problemId')

    const existing = await db.query.dailyProgress.findFirst({
      where: and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.problemId, problemId),
      ),
    })

    if (!existing) return c.json({ success: false, error: 'Problem not found' }, 404)

    await db.update(dailyProgress).set({ status: 'SOLVED' }).where(
      and(eq(dailyProgress.userId, userId), eq(dailyProgress.problemId, problemId)),
    )

    return c.json({ success: true, data: { ...existing, status: 'SOLVED' } })
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to update problem' }, 500)
  }
})

app.get('/log', async (c) => {
  try {
    const userId = c.get('userId')
    const status = c.req.query('status')

    const conditions = [eq(dailyProgress.userId, userId)]
    if (status === 'SOLVED' || status === 'IN_PROGRESS') {
      conditions.push(eq(dailyProgress.status, status))
    }

    const problems = await db.query.dailyProgress.findMany({
      where: and(...conditions),
      orderBy: desc(dailyProgress.date),
    })

    return c.json({ success: true, data: problems })
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch problems' }, 500)
  }
})

export default app
