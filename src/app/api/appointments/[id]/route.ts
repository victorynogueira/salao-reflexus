import { NextResponse } from 'next/server'
import { getAppointment, updateAppointment, cancelAppointment } from '@/lib/datastore'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const appointment = await getAppointment(id)
    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }
    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const appointment = await updateAppointment(id, body)
    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }
    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await cancelAppointment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
