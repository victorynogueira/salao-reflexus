import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/datastore'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'salao-reflexus-secret-key-2024'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
