'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Scissors,
  User,
  DollarSign,
  LogOut,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/utils/format'
import { format, isFuture, isPast } from 'date-fns'

interface Appointment {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  paid: boolean
  notes?: string
  professional: { name: string }
  services: { service: { name: string; price: number } }[]
}

export default function ClientHistoryPage() {
  const [client, setClient] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const user = localStorage.getItem('client-user')
    if (!token || !user) {
      router.push('/cliente')
      return
    }
    const u = JSON.parse(user)
    setClient(u)

    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        const clientAppts = Array.isArray(data) ? data.filter((a: any) => a.clientId === u.id) : []
        setAppointments(clientAppts)
        setLoading(false)
      })
      .catch(() => {
        setAppointments([])
        setLoading(false)
      })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('client-token')
    localStorage.removeItem('client-user')
    router.push('/cliente')
  }

  const pending = appointments.filter(a => a.status === 'PENDING')

  const upcoming = appointments.filter(a => {
    const apptDate = new Date(a.date + 'T' + a.startTime)
    return isFuture(apptDate) && a.status !== 'CANCELLED' && a.status !== 'PENDING'
  })

  const past = appointments.filter(a => {
    const apptDate = new Date(a.date + 'T' + a.startTime)
    return isPast(apptDate) || a.status === 'CANCELLED' || a.status === 'COMPLETED'
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    IN_PROGRESS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  }

  const renderAppointment = (appt: Appointment) => (
    <div key={appt.id} className="mb-3">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
          className="w-full p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                appt.status === 'PENDING' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-primary-50 dark:bg-primary-900/20'
              }`}>
                <Calendar size={20} className={appt.status === 'PENDING' ? 'text-yellow-600' : 'text-primary-600'} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(appt.date)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {appt.startTime} às {appt.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                appt.status === 'COMPLETED' ? 'success' :
                appt.status === 'CANCELLED' ? 'danger' :
                appt.status === 'PENDING' ? 'warning' : 'info'
              }>
                {statusLabels[appt.status] || appt.status}
              </Badge>
              {expandedId === appt.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </div>
        </button>

        {expandedId === appt.id && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User size={16} />
              <span>{appt.professional.name}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Serviços:</p>
              {appt.services.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Scissors size={14} />
                    <span>{s.service.name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(s.service.price)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <DollarSign size={16} />
                <span className="font-medium">Total</span>
              </div>
              <span className="font-bold text-green-600">{formatCurrency(appt.totalPrice)}</span>
            </div>

            {appt.paid && <Badge variant="success">Pago</Badge>}

            {appt.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                {appt.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              {client?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white/80 text-sm">Olá,</p>
              <h1 className="text-white text-xl font-bold">{client?.name}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push('/cliente/agendar')} className="text-white hover:bg-white/10">
              Agendar
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {pending.length > 0 && (
          <div className="mb-6">
            <Card className="border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center animate-pulse">
                    <Bell size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                      {pending.length} Solicitação(ões) Pendente(s)
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                      Aguarde a confirmação da Rosa pelo WhatsApp.
                    </p>
                  </div>
                </div>
                {pending.map(renderAppointment)}
              </CardContent>
            </Card>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Próximos
            </h2>
            {upcoming.map(renderAppointment)}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Histórico
          </h2>
          {past.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum agendamento ainda</p>
              </CardContent>
            </Card>
          ) : (
            past.map(renderAppointment)
          )}
        </div>
      </div>
    </div>
  )
}
