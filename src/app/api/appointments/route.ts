import { NextResponse } from 'next/server'
import { getAppointments, createAppointment, getClients, getProfessionals, getServices } from '@/lib/datastore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const professionalId = searchParams.get('professionalId')
    const status = searchParams.get('status')

    const appointments = await getAppointments(date || undefined, professionalId || undefined, status || undefined)
    return NextResponse.json(appointments)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, professionalId, date, startTime, endTime, services, notes, totalPrice, totalDuration } = body

    if (!clientId || !professionalId || !date || !startTime || !endTime || !services?.length) {
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
    const professional = professionals.find(p => p.id === professionalId)

    if (!client || !professional) {
      return NextResponse.json({ error: 'Cliente ou profissional não encontrado' }, { status: 404 })
    }

    const appointment = await createAppointment({
      clientId,
      client,
      professionalId,
      professional,
      date,
      startTime,
      endTime,
      notes,
      totalPrice: parseFloat(totalPrice) || 0,
      totalDuration: parseInt(totalDuration) || 0,
      status: 'SCHEDULED',
      paid: false,
      services: enrichedServices,
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}
