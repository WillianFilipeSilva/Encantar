'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <img 
            src="/logo.jpg" 
            alt="Encantar Logo" 
            className="w-24 h-24 object-contain mx-auto mb-4 animate-pulse"
          />
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Encantar</h1>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    </div>
  )
}