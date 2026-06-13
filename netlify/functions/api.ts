import { handle } from 'hono/netlify'
import { stream } from '@netlify/functions'
import { Readable } from 'node:stream'
import app from '../../server/index'

const honoHandler = handle(app)

export const handler = stream(async (event, context) => {
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
  const headers = Object.fromEntries(response.headers)

  if (response.body && headers['content-type']?.startsWith('text/event-stream')) {
    return {
      statusCode: response.status,
      headers,
      body: Readable.from(response.body as ReadableStream),
    }
  }

  return {
    statusCode: response.status,
    headers,
    body: await response.text(),
  }
})
