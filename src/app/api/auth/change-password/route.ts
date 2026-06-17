import { NextResponse } from 'next/server'
import { getUserByEmail, getUsers, updateClient } from '@/lib/datastore'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 })
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 4 caracteres' }, { status: 400 })
    }

    const user = await getUserByEmail(body.email)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const users = await getUsers()
    const index = users.findIndex(u => u.id === user.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    users[index].password = hashedPassword
    users[index].updatedAt = new Date().toISOString()

    const { writeData } = await import('@/lib/storage')
    await writeData('users.json', users)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
