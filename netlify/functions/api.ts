import { handle } from 'hono/netlify'
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import app from '../../server/index'

const honoHandler = handle(app)

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const host = event.headers['x-forwarded-host'] || event.headers['host'] || 'localhost'
  const url = new URL(event.path, `https://${host}`)

  if (event.queryStringParameters) {
    for (const [key, value] of Object.entries(event.queryStringParameters)) {
      if (value) url.searchParams.set(key, value)
    }
  }

  const body =
    event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD'
      ? event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : event.body
      : undefined

  const request = new Request(url.toString(), {
    method: event.httpMethod || 'GET',
    headers: new Headers(event.headers as Record<string, string>),
    body,
  })

  const response = await honoHandler(request, context)

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  }
}

export { handler }
