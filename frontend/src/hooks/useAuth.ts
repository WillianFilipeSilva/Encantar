'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nome: string
  login: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const checkAuth = () => {
      const token = localStorage.getItem('@encantar:token')
      const userData = localStorage.getItem('@encantar:user')

      if (token && userData && userData !== 'undefined' && userData !== 'null' && userData.trim() !== '') {
        try {
          const parsedUser = JSON.parse(userData)
          
          if (parsedUser && parsedUser.id) {
            setIsAuthenticated(true)
            setUser(parsedUser)
          } else {
            throw new Error('Dados do usuário inválidos')
          }
        } catch (error) {
          console.error('Erro ao fazer parse do userData:', error)
          // Se o userData está corrompido, limpa o localStorage
          localStorage.removeItem('@encantar:token')
          localStorage.removeItem('@encantar:refresh-token')
          localStorage.removeItem('@encantar:user')
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [isClient])

  const login = (userData: User, token: string, refreshToken?: string) => {
    try {
      // Validar dados antes de salvar
      if (!userData || !userData.id || !token) {
        throw new Error('Dados de login inválidos')
      }

      const userDataString = JSON.stringify(userData)

      localStorage.setItem('@encantar:token', token)
      localStorage.setItem('@encantar:user', userDataString)
      
      if (refreshToken) {
        localStorage.setItem('@encantar:refresh-token', refreshToken)
      }

      setIsAuthenticated(true)
      setUser(userData)
      
      return true
    } catch (error) {
      console.error('Erro ao salvar dados de login:', error)
      return false
    }
  }

  const logout = () => {
    // Limpar dados do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@encantar:token')
      localStorage.removeItem('@encantar:refresh-token')
      localStorage.removeItem('@encantar:user')
    }
    
    // Atualizar estado
    setIsAuthenticated(false)
    setUser(null)
    
    // Redirecionar para login
    router.push('/login')
  }

  // Função para verificar se o token é válido
  const checkTokenValidity = () => {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem('@encantar:token')
    const user = localStorage.getItem('@encantar:user')
    
    if (!token || !user) {
      return false
    }
    
    try {
      // Validar se o userData não está corrompido
      const parsedUser = JSON.parse(user)
      return parsedUser && parsedUser.id
    } catch {
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