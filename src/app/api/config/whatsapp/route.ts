import { NextResponse } from 'next/server'
import { isWhatsAppConfigured } from '@/lib/whatsapp'

export async function GET() {
  return NextResponse.json({ configured: isWhatsAppConfigured() })
}
