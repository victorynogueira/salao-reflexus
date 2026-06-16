import { NextResponse } from 'next/server'
import { getClient, getAppointments, updateClient, deleteClient } from '@/lib/datastore'
import bcrypt from 'bcryptjs'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await getClient(params.id)
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const appointments = await getAppointments()
    const clientAppointments = appointments
      .filter(a => a.clientId === params.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const safeClient = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      username: client.username,
      mustChangePassword: client.mustChangePassword,
      notes: client.notes,
      active: client.active,
      createdAt: client.createdAt,
      appointments: clientAppointments,
    }

    return NextResponse.json(safeClient)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, phone, notes, regeneratePassword } = body

    if (regeneratePassword) {
      const newPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      const client = await updateClient(params.id, {
        password: hashedPassword,
        mustChangePassword: true,
      })
      if (!client) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
      return NextResponse.json({
        id: client.id,
        name: client.name,
        username: client.username,
        newPassword,
        mustChangePassword: true,
      })
    }

    const client = await updateClient(params.id, { name, phone, notes })
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteClient(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
