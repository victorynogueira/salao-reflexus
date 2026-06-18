import { NextResponse } from 'next/server'
import { getAppointment, updateAppointment } from '@/lib/datastore'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    const appointment = await getAppointment(id)
    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (action === 'confirm') {
      await updateAppointment(id, { status: 'SCHEDULED' })
    } else if (action === 'reject') {
      await updateAppointment(id, { status: 'CANCELLED' })
    } else if (action === 'complete') {
      await updateAppointment(id, { status: 'COMPLETED' })
    } else if (action === 'cancel') {
      await updateAppointment(id, { status: 'CANCELLED' })
    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
