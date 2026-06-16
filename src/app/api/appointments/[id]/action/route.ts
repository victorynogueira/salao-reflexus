import { NextResponse } from 'next/server'
import { getAppointment, updateAppointment } from '@/lib/datastore'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    const appointment = await getAppointment(params.id)
    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (action === 'confirm') {
      await updateAppointment(params.id, { status: 'SCHEDULED' })
    } else if (action === 'reject') {
      await updateAppointment(params.id, { status: 'CANCELLED' })
    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
