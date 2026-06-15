const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  let data: any
  try {
    data = await res.json()
  } catch {
    throw new Error(`Server error (${res.status})`)
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

async function consumeSSE<T>(
  path: string,
  callbacks: {
    onToken?: (text: string) => void
    onDone?: (data: T) => void
    onError?: (message: string, retryAfter?: number) => void
  },
): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: 'POST' })
  if (!res.ok) throw new Error(`Server error (${res.status})`)

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    while (true) {
      const lineEnd = buffer.indexOf('\n')
      if (lineEnd === -1) break
      const line = buffer.slice(0, lineEnd)
      buffer = buffer.slice(lineEnd + 1)

      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        if (data.type === 'token' && callbacks.onToken) callbacks.onToken(data.text)
        else if (data.type === 'done' && callbacks.onDone) callbacks.onDone(data.data)
        else if (data.type === 'error') {
          if (callbacks.onError) callbacks.onError(data.message, data.retryAfter)
          throw new Error(data.message)
        }
      }
    }
  }
}

export const api = {
  survey: {
    submit: (body: { email: string; struggles: string[]; desiredFeature: string; goals: string[] }) =>
      request<{ success: boolean }>('/survey', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<{ success: boolean; data: any[] }>('/survey'),
  },
  leetcode: {
    link: (body: { leetcodeUsername: string }) =>
      request<{ success: boolean; data: any }>('/leetcode/link', { method: 'POST', body: JSON.stringify(body) }),
    stats: () => request<{ success: boolean; data: any }>('/leetcode/stats'),
    refresh: () => request<{ success: boolean; data: any }>('/leetcode/refresh', { method: 'POST' }),
    log: (body: { problemId: string; problemName: string; difficulty: string; topics: string[] }) =>
      request<{ success: boolean; data: any }>('/leetcode/log', { method: 'POST', body: JSON.stringify(body) }),
    markSolved: (problemId: string) =>
      request<{ success: boolean }>(`/leetcode/log/${problemId}`, { method: 'PATCH' }),
    listProblems: (status?: string) =>
      request<{ success: boolean; data: any[] }>(`/leetcode/log${status ? `?status=${status}` : ''}`),
  },
  onboard: {
    status: () => request<{ success: boolean; data: any }>('/onboard'),
    submit: (body: { experienceLevel: string; goals: string[]; weakTopics: string[]; targetCompanies?: string[]; hoursPerWeek: number; targetDate?: string }) =>
      request<{ success: boolean }>('/onboard', { method: 'POST', body: JSON.stringify(body) }),
  },
  plan: {
    roadmap: () => request<{ success: boolean; data: any }>('/plan/roadmap'),
    roadmapGenerate: (callbacks: {
      onToken?: (text: string) => void
      onDone?: (data: any) => void
      onError?: (message: string, retryAfter?: number) => void
    }, force?: boolean) => consumeSSE(`/plan/roadmap/generate${force ? '?force=true' : ''}`, callbacks),
    roadmapProgress: () => request<{ success: boolean; data: any }>('/plan/roadmap/progress'),
    roadmapAdvance: () =>
      request<{ success: boolean; data: any }>('/plan/roadmap/advance', { method: 'PATCH' }),
    today: {
      get: () => request<{ success: boolean; exists: boolean; data: any | null }>('/plan/today'),
      generate: (difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED') =>
        request<{ success: boolean; data: any }>('/plan/today', {
          method: 'POST',
          body: JSON.stringify({ difficulty: difficulty || 'MIXED' }),
        }),
      markProblem: (planId: string, slug: string, status: 'SOLVED' | 'TRIED' | 'SKIPPED' | 'PENDING') =>
        request<{ success: boolean; data: any }>(`/plan/today/${planId}/problem/${slug}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
      regenerate: (planId: string, slot?: number, easier?: boolean) =>
        request<{ success: boolean; data: any }>(`/plan/today/${planId}/regenerate`, {
          method: 'POST',
          body: JSON.stringify({ slot, easier }),
        }),
    },
    streak: () => request<{ success: boolean; data: { currentStreak: number; longestStreak: number; solvedToday: boolean } }>('/plan/streak'),
    history: () => request<{ success: boolean; data: any[] }>('/plan/history'),
  },
}
