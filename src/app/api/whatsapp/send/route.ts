import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage, generateCredentialsMessage } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const { to, message, type, name, username, password } = await request.json()

    let finalMessage = message
    if (type === 'credentials' && name && username && password) {
      finalMessage = generateCredentialsMessage(name, username, password)
    }

    if (!to || !finalMessage) {
      return NextResponse.json({ error: 'Número e mensagem são obrigatórios' }, { status: 400 })
    }

    const result = await sendWhatsAppMessage(to, finalMessage)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
