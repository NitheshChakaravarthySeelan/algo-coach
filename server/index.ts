import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { auth } from './auth'
import { rateLimit } from './middleware/rate-limit'
import surveyRoutes from './routes/survey'
import leetcodeRoutes from './routes/leetcode'
import onboardRoutes from './routes/onboard'
import planRoutes from './routes/plan'
import path from 'path'
import fs from 'fs'

const app = new Hono()

app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, error: err.message || 'Internal server error' }, 500)
})

const productionUrl = process.env.BETTER_AUTH_URL || ''

app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', productionUrl],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('/api/survey', rateLimit(10, 60000))
app.use('/api/leetcode/link', rateLimit(5, 60000))
app.use('/api/leetcode/log', rateLimit(30, 60000))
app.use('/api/leetcode/refresh', rateLimit(10, 60000))

app.all('/api/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api/survey', surveyRoutes)
app.route('/api/leetcode', leetcodeRoutes)
app.route('/api/onboard', onboardRoutes)
app.route('/api/plan', planRoutes)

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

const distPath = path.resolve(import.meta.dir, "..", "dist")
if (fs.existsSync(distPath)) {
  app.use('/assets/*', serveStatic({ root: distPath }))
  app.use('/favicon.svg', serveStatic({ root: distPath }))
  app.use('/icons.svg', serveStatic({ root: distPath }))
  app.get('*', async (c) => {
    if (c.req.path.startsWith('/api/')) return c.text('Not found', 404)
    const file = Bun.file(path.join(distPath, 'index.html'))
    if (await file.exists()) return new Response(file, { headers: { 'Content-Type': 'text/html' } })
    return c.text('Not found', 404)
  })
}

export function serve(preferredPort: number = 3000) {
  const maxAttempts = 10
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i
    try {
      const server = Bun.serve({ fetch: app.fetch, port, idleTimeout: 255 })
      return { server, port }
    } catch (err: any) {
      if (err.code !== "EADDRINUSE" || i === maxAttempts - 1) {
        throw err
      }
    }
  }
}

export default app
