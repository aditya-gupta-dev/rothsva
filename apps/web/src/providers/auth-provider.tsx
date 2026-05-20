import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiRequest } from '../lib/api'
import type { LoginResponse, MeResponse, RegisterResponse } from '../lib/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

const STORAGE_KEY = 'zapisi.auth-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem(STORAGE_KEY),
  )
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(token))

  useEffect(() => {
    if (!token) {
      return
    }

    const activeToken = token
    let cancelled = false

    async function hydrateSession() {
      try {
        const response = await apiRequest<MeResponse>('/me', {
          method: 'GET',
          token: activeToken,
        })

        if (cancelled) {
          return
        }

        setUser(response.user)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    hydrateSession()

    return () => {
      cancelled = true
    }
  }, [token])

  async function login(input: Parameters<AuthContextValue['login']>[0]) {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    window.localStorage.setItem(STORAGE_KEY, response.token)
    setIsLoading(false)
    setToken(response.token)
    setUser(response.user)
  }

  async function register(input: Parameters<AuthContextValue['register']>[0]) {
    await apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    await login({ email: input.email, password: input.password })
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY)
    setIsLoading(false)
    setToken(null)
    setUser(null)
  }

  const value: AuthContextValue = {
    isAuthenticated: Boolean(token && user),
    isLoading,
    token,
    user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
