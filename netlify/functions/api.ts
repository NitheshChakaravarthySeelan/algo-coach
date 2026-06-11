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

  const host = headers?.['host'] || headers?.['x-forwarded-host'] || 'localhost'
  const url = new URL(path || '/', `https://${host}`)
  if (queryStringParameters) {
    for (const [k, v] of Object.entries(queryStringParameters)) {
      if (v) url.searchParams.set(k, v as string)
    }
  }

  const req = new Request(url.toString(), {
    method: method || 'GET',
    headers: headers || {},
    body: method !== 'GET' && method !== 'HEAD' && body
      ? (isBase64Encoded ? Buffer.from(body, 'base64') : body)
      : undefined,
  })

  const response = await honoHandler(req, context)

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  }
}
