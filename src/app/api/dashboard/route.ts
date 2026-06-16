import { NextResponse } from 'next/server'
import { getAppointments, getClients, getTransactions, getServices, getProfessionals } from '@/lib/datastore'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from 'date-fns'

export async function GET() {
  try {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)

    const allAppointments = await getAppointments()
    const allClients = await getClients()
    const allTransactions = await getTransactions()
    const allServices = await getServices()
    const allProfessionals = await getProfessionals()

    const todayAppointments = allAppointments.filter(a => {
      const d = new Date(a.date)
      return d >= startOfDay(today) && d <= endOfDay(today) && a.status !== 'CANCELLED'
    }).length

    const monthAppointments = allAppointments.filter(a => {
      const d = new Date(a.date)
      return d >= monthStart && d <= monthEnd && a.status !== 'CANCELLED'
    }).length

    const todayRevenue = allAppointments
      .filter(a => {
        const d = new Date(a.date)
        return d >= startOfDay(today) && d <= endOfDay(today) && a.status === 'COMPLETED' && a.paid
      })
      .reduce((sum, a) => sum + a.totalPrice, 0)

    const monthRevenue = allAppointments
      .filter(a => {
        const d = new Date(a.date)
        return d >= monthStart && d <= monthEnd && a.status === 'COMPLETED' && a.paid
      })
      .reduce((sum, a) => sum + a.totalPrice, 0)

    const newClientsThisMonth = allClients.filter(c => {
      const d = new Date(c.createdAt)
      return d >= monthStart && d <= monthEnd
    }).length

    const serviceCount: Record<string, number> = {}
    allAppointments.forEach(a => {
      if (a.status === 'CANCELLED') return
      a.services?.forEach(s => {
        serviceCount[s.serviceId] = (serviceCount[s.serviceId] || 0) + 1
      })
    })

    const topServices = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([serviceId, count]) => ({
        serviceId,
        service: allServices.find(s => s.id === serviceId),
        count,
      }))

    const profCount: Record<string, number> = {}
    allAppointments.forEach(a => {
      if (a.status === 'CANCELLED') return
      profCount[a.professionalId] = (profCount[a.professionalId] || 0) + 1
    })

    const topProfessionals = Object.entries(profCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([professionalId, count]) => ({
        professionalId,
        professional: allProfessionals.find(p => p.id === professionalId),
        count,
      }))

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      return format(date, 'yyyy-MM-dd')
    })

    const dailyRevenue = last7Days.map(date => {
      const dayStart = startOfDay(new Date(date))
      const dayEnd = endOfDay(new Date(date))
      const revenue = allAppointments
        .filter(a => {
          const d = new Date(a.date)
          return d >= dayStart && d <= dayEnd && a.status === 'COMPLETED' && a.paid
        })
        .reduce((sum, a) => sum + a.totalPrice, 0)
      return {
        date: format(new Date(date), 'dd/MM'),
        revenue,
      }
    })

    return NextResponse.json({
      todayAppointments,
      monthAppointments,
      todayRevenue,
      monthRevenue,
      newClientsThisMonth,
      topServices,
      topProfessionals,
      recentTransactions: allTransactions.slice(0, 10),
      dailyRevenue,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
