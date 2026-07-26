import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginRequest, signupRequest } from '../services/auth'

const AuthContext = createContext(null)

const TOKEN_KEY = 'cg_token'
const USER_KEY = 'cg_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token && !!user

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await loginRequest(email, password)
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (name, email, password, phone) => {
    setLoading(true)
    try {
      const data = await signupRequest(name, email, password, phone)
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
