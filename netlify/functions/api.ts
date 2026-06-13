import { handle } from 'hono/netlify'
import app from '../../server/index'

export default handle(app)
