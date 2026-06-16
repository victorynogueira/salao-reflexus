import { NextResponse } from 'next/server'
import { getClient, updateClient, getClients } from '@/lib/datastore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, currentPassword, newPassword } = body

    if (!clientId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 4 caracteres' }, { status: 400 })
    }

    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const bcrypt = await import('bcryptjs')
    const isValid = await bcrypt.compare(currentPassword, client.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await updateClient(clientId, {
      password: hashedPassword,
      mustChangePassword: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
