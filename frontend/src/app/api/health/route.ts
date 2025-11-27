import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  let backendStatus = 'unknown'
  let backendResponseTime = 0

  try {
    const startTime = Date.now()
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    })
    backendResponseTime = Date.now() - startTime
    
    if (response.ok) {
      backendStatus = 'healthy'
    } else {
      backendStatus = 'unhealthy'
    }
  } catch (error) {
    backendStatus = 'unreachable'
  }

  const isHealthy = backendStatus === 'healthy'

  return NextResponse.json(
    {
      status: isHealthy ? 'OK' : 'DEGRADED',
      service: 'Encantar Frontend',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      checks: {
        backend: {
          status: backendStatus,
          url: backendUrl,
          responseTime: `${backendResponseTime}ms`,
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  )
}
