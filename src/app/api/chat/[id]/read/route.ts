import { NextResponse } from 'next/server'
import { markMessageRead } from '@/lib/datastore'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const success = await markMessageRead(id)
    if (!success) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
