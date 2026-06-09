const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  waitlist: {
    submit: (body: {
      name: string
      email: string
      leetcodeUsername?: string
      experience: string
    }) =>
      request<{ success: boolean; data: { id: string } }>('/waitlist', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: () =>
      request<{ success: boolean; data: any[] }>('/waitlist'),
  },
  survey: {
    submit: (body: {
      email: string
      struggles?: string[]
      desiredFeature?: string
      goals?: string[]
    }) =>
      request<{ success: boolean; data: { id: string } }>('/survey', {
        method: 'POST',
        body: JSON.stringify({
          email: body.email,
          struggles: body.struggles || [],
          desiredFeature: body.desiredFeature || '',
          goals: body.goals || [],
        }),
      }),
    list: () =>
      request<{ success: boolean; data: any[] }>('/survey'),
  },
}
