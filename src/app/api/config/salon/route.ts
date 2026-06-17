import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'

interface SalonConfig {
  name: string
  address: string
  phone: string
}

export async function GET() {
  try {
    const data = await readData<SalonConfig>('salon-config.json')
    return NextResponse.json(Array.isArray(data) ? (data[0] || {}) : (data || {}))
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await writeData<SalonConfig>('salon-config.json', [body as any])
    return NextResponse.json({ success: true, ...body })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
