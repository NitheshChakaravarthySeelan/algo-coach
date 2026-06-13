import { createMiddleware } from 'hono/factory'
import { auth } from '../auth'
import { db } from '../db'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'
import { isLocalDev, DEV_USER_ID } from '../local-dev'

export const authMiddleware = createMiddleware(async (c, next) => {
  if (isLocalDev()) {
    const userId = process.env.LOCAL_USER_ID || DEV_USER_ID
    const existing = await db.query.user.findFirst({ where: eq(user.id, userId) })
    if (!existing) {
      await db.insert(user).values({
        id: userId,
        name: 'Dev User',
        email: 'dev@local.dev',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    c.set('userId', userId)
    await next()
    return
  }
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId', session.user.id)
  await next()
})
