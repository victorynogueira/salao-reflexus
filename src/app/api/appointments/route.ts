import { NextResponse } from 'next/server'
import { getAppointments, createAppointment, getProfessionals, getServices, getClients } from '@/lib/datastore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const appointments = await getAppointments(date || undefined, undefined, status || undefined)

    if (clientId) {
      return NextResponse.json(appointments.filter(a => a.clientId === clientId))
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, date, startTime, services, notes, totalPrice, totalDuration, isClientRequest } = body

    if (!clientId || !date || !startTime || !services?.length) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    const allServices = await getServices()
    const enrichedServices = services.map((s: any) => {
      const service = allServices.find(svc => svc.id === s.serviceId)
      return {
        serviceId: s.serviceId,
        service: service || { name: 'Serviço', price: s.price },
        price: parseFloat(s.price),
        commission: parseFloat(s.commission) || 0,
        duration: parseInt(s.duration),
      }
    })

    const clients = await getClients()
    const client = clients.find(c => c.id === clientId)
    const professionals = await getProfessionals()
    const professional = professionals.find(p => p.active)

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }
    if (!professional) {
      return NextResponse.json({ error: 'Nenhuma profissional disponível' }, { status: 404 })
    }

    const duration = totalDuration || enrichedServices.reduce((sum: number, s: any) => sum + s.duration, 0)
    const endTime = calculateEndTime(startTime, duration)

    const existing = await getAppointments(date, undefined, undefined)
    const conflict = existing.find(a =>
      a.professionalId === professional.id &&
      a.status !== 'CANCELLED' &&
      startTime < a.endTime &&
      endTime > a.startTime
    )

    if (conflict) {
      return NextResponse.json({ error: 'Horário indisponível' }, { status: 409 })
    }

    // Store minimal client/professional data (no passwords)
    const clientRef = { id: client.id, name: client.name, phone: client.phone, username: client.username, active: client.active, createdAt: client.createdAt, updatedAt: client.updatedAt }
    const professionalRef = { id: professional.id, name: professional.name, specialty: professional.specialty, commission: professional.commission, active: professional.active, createdAt: professional.createdAt, updatedAt: professional.updatedAt }

    const appointment = await createAppointment({
      clientId,
      client: clientRef as any,
      professionalId: professional.id,
      professional: professionalRef as any,
      date,
      startTime,
      endTime,
      notes,
      totalPrice: parseFloat(totalPrice) || 0,
      totalDuration: duration,
      status: isClientRequest ? 'PENDING' : 'SCHEDULED',
      paid: false,
      services: enrichedServices,
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const total = h * 60 + m + durationMinutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
