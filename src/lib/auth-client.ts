import { createAuthClient } from 'better-auth/react'

const baseURL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`

export const authClient = createAuthClient({ baseURL })
