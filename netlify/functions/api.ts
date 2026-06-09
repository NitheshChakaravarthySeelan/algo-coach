import { handle } from 'hono/netlify'
import app from '../../server/index'

export const handler = handle(app)
