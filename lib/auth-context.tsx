"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  isAdmin: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde admin durumunu kontrol et
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin') === 'true'
      setIsAdmin(adminStatus)
      setLoading(false)
    }
  }, [])

  const login = async (password: string): Promise<boolean> => {
    // Basit admin şifresi kontrolü (gerçek uygulamada daha güvenli olmalı)
    if (password === 'admin123') {
      setIsAdmin(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdmin', 'true')
        
        // Mock JWT token oluştur (gerçek uygulamada API'den gelecek)
        // Bu token, API route'larında admin yetkisi gerektiren işlemlerde kullanılacak
        const mockToken = btoa(JSON.stringify({
          userId: "admin-001",
          email: "admin@example.com",
          role: "admin",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 gün
        }))
        
        localStorage.setItem('token', mockToken)
      }
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('token')
    }
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
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