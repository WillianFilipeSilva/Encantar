'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/axios'
import { User } from '@/lib/types'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || hasCheckedAuth) return

    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const path = window.location.pathname
          if (path === '/login' || path.startsWith('/register/')) {
            setIsAuthenticated(false)
            setUser(null)
            setIsLoading(false)
            setHasCheckedAuth(true)
            return
          }
        }

        const response = await api.get('/auth/me')

        if (response.data.success && response.data.data) {
          setIsAuthenticated(true)
          setUser(response.data.data)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setUser(null)
      }
      
      setIsLoading(false)
      setHasCheckedAuth(true)
    }

    checkAuth()
  }, [isClient, hasCheckedAuth])

  const login = (userData: User) => {
    try {
      if (!userData || !userData.id) {
        throw new Error('Dados de login inválidos')
      }

      setIsAuthenticated(true)
      setUser(userData)
      setHasCheckedAuth(true)
      
      return true
    } catch (error) {
      console.error('Erro ao processar login:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
    
    setIsAuthenticated(false)
    setUser(null)
    setHasCheckedAuth(false)
    router.push('/login')
  }

  const checkTokenValidity = async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data.success
    } catch (error) {
      return false
    }
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkTokenValidity
  }
}