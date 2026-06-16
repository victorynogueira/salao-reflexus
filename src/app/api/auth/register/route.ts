import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/datastore'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'ADMIN' } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: role as 'ADMIN' | 'RECEPTIONIST',
      active: true,
    })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
