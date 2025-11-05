import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    service: 'Encantar Frontend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  })
}
