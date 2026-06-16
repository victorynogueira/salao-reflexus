import { NextResponse } from 'next/server'
import { getClientByUsername } from '@/lib/datastore'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'salao-reflexus-secret-key-2024'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 })
    }

    const client = await getClientByUsername(username)

    if (!client) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!client.password) {
      return NextResponse.json({ error: 'Você ainda não tem senha. Peça ao salão para configurar.' }, { status: 403 })
    }

    const isValid = await bcrypt.compare(password, client.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Senha inválida' }, { status: 401 })
    }

    const token = jwt.sign(
      { id: client.id, name: client.name, username: client.username, type: 'client' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        username: client.username,
        mustChangePassword: client.mustChangePassword,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
