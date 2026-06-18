import { NextResponse } from 'next/server'
import { getConversations, getClients } from '@/lib/datastore'

export async function GET() {
  try {
    const convData = await getConversations()
    const clients = await getClients()

    const result = convData.map(item => {
      const client = clients.find(c => c.id === item.clientId)
      return {
        clientId: item.clientId,
        clientName: client?.name || 'Desconhecido',
        count: item.unread,
        lastMessage: item.lastMessage,
        lastTime: item.lastTime,
      }
    })

    const total = result.reduce((sum, r) => sum + r.count, 0)

    return NextResponse.json({ total, conversations: result })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json({ total: 0, conversations: [] })
  }
}
