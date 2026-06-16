import { NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/datastore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const clients = await getClients(search)
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, notes } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 })
    }

    const clients = await getClients()
    if (clients.find(c => c.phone === phone)) {
      return NextResponse.json({ error: 'Telefone já cadastrado' }, { status: 409 })
    }

    const client = await createClient({ name, phone, email, notes })
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
