import { createMiddleware } from 'hono/factory'

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60_000)

export function rateLimit(maxRequests: number, windowMs: number) {
  return createMiddleware(async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    let entry = store.get(key)
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs }
      store.set(key, entry)
    }

    entry.count++

    if (entry.count > maxRequests) {
      return c.json({ error: 'Too many requests, please try again later' }, 429)
    }

    await next()
  })
}
