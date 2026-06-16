import { NextResponse } from 'next/server'
import { getClient, getAppointments, updateClient, deleteClient } from '@/lib/datastore'

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

    return NextResponse.json({ ...client, appointments: clientAppointments })
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
    const client = await updateClient(params.id, body)
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
