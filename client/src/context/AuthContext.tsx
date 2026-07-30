import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loginRequest, logoutRequest, meRequest, registerRequest } from '../api/auth.api'
import type { User } from '../types/models'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshMe() {
    try {
      const me = await meRequest()
      setUser(me)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refreshMe().finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const loggedInUser = await loginRequest({ email, password })
    setUser(loggedInUser)
  }

  async function register(email: string, password: string, name: string) {
    const registeredUser = await registerRequest({ email, password, name })
    setUser(registeredUser)
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
