'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { authApi } from '@/lib/api-mock'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      validateSession(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateSession = async (storedToken: string) => {
    const response = await authApi.validateToken(storedToken)
    if (response.success && response.data) {
      setUser(response.data.user)
      setToken(storedToken)
    } else {
      localStorage.removeItem('auth_token')
    }
    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    if (response.success && response.data) {
      setUser(response.data.user)
      setToken(response.data.token)
      localStorage.setItem('auth_token', response.data.token)
      return { success: true }
    }
    return { success: false, error: response.error?.message }
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
