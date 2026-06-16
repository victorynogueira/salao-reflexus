import { NextResponse } from 'next/server'
import { getAppointment, updateAppointment, cancelAppointment } from '@/lib/datastore'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await getAppointment(params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const appointment = await updateAppointment(params.id, body)
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
  { params }: { params: { id: string } }
) {
  try {
    await cancelAppointment(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
