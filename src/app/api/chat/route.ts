import { NextResponse } from 'next/server'
import { getMessages, createMessage, getUnreadCount } from '@/lib/datastore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const messages = await getMessages(clientId || undefined)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { clientId, text, from } = await request.json()

    if (!clientId || !text || !from) {
      return NextResponse.json({ error: 'clientId, text e from são obrigatórios' }, { status: 400 })
    }

    if (!['client', 'admin'].includes(from)) {
      return NextResponse.json({ error: 'from deve ser "client" ou "admin"' }, { status: 400 })
    }

    const message = await createMessage({
      clientId,
      from,
      text,
      read: false,
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar mensagem:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
