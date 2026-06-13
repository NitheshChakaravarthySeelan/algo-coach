import { useRef } from 'react'
import { authClient } from './auth-client'

const isLocalDev = import.meta.env.VITE_LOCAL_DEV === 'true'

const DEV_SESSION = { data: { user: { id: 'dev-user-id', name: 'Dev User', email: 'dev@local.dev' } }, isPending: false } as const

export function useSession() {
  const ref = useRef(DEV_SESSION)
  if (isLocalDev) return ref.current
  return authClient.useSession()
}
