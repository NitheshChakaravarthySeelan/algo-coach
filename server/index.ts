import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import waitlistRoutes from './routes/waitlist'
import surveyRoutes from './routes/survey'

const app = new Hono()

app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.all('/api/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api/waitlist', waitlistRoutes)
app.route('/api/survey', surveyRoutes)

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

export default app
