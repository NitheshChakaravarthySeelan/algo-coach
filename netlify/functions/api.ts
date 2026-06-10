import { handle } from 'hono/netlify'
import app from '../../server/index'

const honoHandler = handle(app)

export const handler = async (event: any, context: any) => {
  const {
    httpMethod: method,
    headers,
    body,
    isBase64Encoded,
    path,
    queryStringParameters,
  } = event

  const url = new URL(path || '/', 'https://algo-coach.netlify.app')
  if (queryStringParameters) {
    for (const [k, v] of Object.entries(queryStringParameters)) {
      if (v) url.searchParams.set(k, v as string)
    }
  }

  const req = new Request(url, {
    method: method || 'GET',
    headers: headers || {},
    body: method !== 'GET' && method !== 'HEAD' && body
      ? (isBase64Encoded ? Buffer.from(body, 'base64') : body)
      : undefined,
  })

  return honoHandler(req, context)
}
