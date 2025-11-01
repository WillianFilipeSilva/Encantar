'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function NotFoundPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

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
          <p className="text-gray-600 mt-2">Redirecionando...</p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    </div>
  )
}