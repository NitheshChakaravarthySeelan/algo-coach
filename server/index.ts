import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { rateLimit } from './middleware/rate-limit'
import surveyRoutes from './routes/survey'
import leetcodeRoutes from './routes/leetcode'
import onboardRoutes from './routes/onboard'
import planRoutes from './routes/plan'

const app = new Hono()

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

export default app
