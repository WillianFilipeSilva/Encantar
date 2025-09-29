'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/axios"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const { user, isLoading: authLoading, login: authLogin } = useAuth()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', {
        login,
        senha
      })

      const authData = response.data.data
      const { user, accessToken, refreshToken } = authData

      const success = authLogin(user, accessToken, refreshToken)
      
      if (success) {
        router.push('/dashboard')
      } else {
        throw new Error('Erro ao salvar dados de login')
      }
    } catch (error: any) {
      console.error('Erro de login:', error)
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        setError('Erro de conexão com o servidor. Verifique se o backend está funcionando.')
      } else if (error.response?.status === 429) {
        setError('Muitas tentativas de login. Tente novamente mais tarde.')
      } else {
        setError(error.response?.data?.error || 'Erro ao fazer login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 pb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="Encantar Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Encantar</h3>
              <p className="text-sm text-gray-600 mt-1">Sistema de Entregas</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="login" className="text-sm font-medium">
                Login
              </label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite seu login"
                autoComplete="username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="senha" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Credenciais de acesso:</p>
            <p className="text-sm text-blue-600">Login: <code>admin</code></p>
            <p className="text-sm text-blue-600">Senha: <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}