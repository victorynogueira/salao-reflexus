import { NextResponse } from 'next/server'
import { getClients, createClient, getClientByUsername, generateUsername, generatePassword } from '@/lib/datastore'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const clients = await getClients(search)
    const safeClients = clients.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      username: c.username,
      mustChangePassword: c.mustChangePassword,
      notes: c.notes,
      active: c.active,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
    return NextResponse.json(safeClients)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, notes } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 })
    }

    const clients = await getClients()
    if (clients.find(c => c.phone === phone)) {
      return NextResponse.json({ error: 'Telefone já cadastrado' }, { status: 409 })
    }

    const username = generateUsername(name)
    const plainPassword = generatePassword()
    const client = await createClient({ name, phone, notes, username, password: plainPassword, mustChangePassword: true })

    return NextResponse.json({
      id: client.id,
      name: client.name,
      phone: client.phone,
      username: client.username,
      password: client.password,
      mustChangePassword: client.mustChangePassword,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}
