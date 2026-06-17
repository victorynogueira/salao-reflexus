'use client'

import { useState, useEffect } from 'react'
import ClientLayout from '@/components/layout/ClientLayout'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Calendar, Clock, Scissors, DollarSign, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
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
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('client-user') || '{}')
    if (!user.id) return

    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        const clientAppts = Array.isArray(data) ? data.filter((a: any) => a.clientId === user.id && a.status !== 'CANCELLED') : []
        setAppointments(clientAppts)
        setLoading(false)
      })
      .catch(() => {
        setAppointments([])
        setLoading(false)
      })
  }, [])

  const pending = appointments.filter(a => a.status === 'PENDING')

  const upcoming = appointments.filter(a => {
    const apptDate = new Date(a.date + 'T' + a.startTime)
    return isFuture(apptDate) && a.status !== 'CANCELLED' && a.status !== 'PENDING'
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const past = appointments.filter(a => {
    const apptDate = new Date(a.date + 'T' + a.startTime)
    return isPast(apptDate) || a.status === 'CANCELLED' || a.status === 'COMPLETED'
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pendente', color: 'warning' },
    SCHEDULED: { label: 'Agendado', color: 'info' },
    CONFIRMED: { label: 'Confirmado', color: 'success' },
    IN_PROGRESS: { label: 'Em Andamento', color: 'info' },
    COMPLETED: { label: 'Concluído', color: 'default' },
    CANCELLED: { label: 'Cancelado', color: 'danger' },
    NO_SHOW: { label: 'Não Compareceu', color: 'danger' },
  }

  const renderAppointment = (appt: Appointment) => (
    <div key={appt.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-3">
      <button
        onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              appt.status === 'PENDING'
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : appt.status === 'CANCELLED'
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-primary-50 dark:bg-primary-900/20'
            }`}>
              <Calendar size={20} className={
                appt.status === 'PENDING' ? 'text-yellow-600' :
                appt.status === 'CANCELLED' ? 'text-red-600' :
                'text-primary-600'
              } />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {formatDate(appt.date)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {appt.startTime} às {appt.endTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig[appt.status]?.color as any}>
              {statusConfig[appt.status]?.label || appt.status}
            </Badge>
            {expandedId === appt.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>
      </button>

      {expandedId === appt.id && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Profissional</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{appt.professional.name}</span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serviços:</p>
            {appt.services.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Scissors size={14} />
                  <span>{s.service.name}</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(s.service.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <DollarSign size={16} />
              <span className="font-medium">Total</span>
            </div>
            <span className="font-bold text-green-600 text-lg">{formatCurrency(appt.totalPrice)}</span>
          </div>

          {appt.paid && <Badge variant="success">Pago</Badge>}

          {appt.notes && (
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              {appt.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meus Agendamentos</h1>
          <p className="text-gray-500 dark:text-gray-400">Acompanhe o status dos seus agendamentos</p>
        </div>

        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pendentes</h2>
              <Badge variant="warning">{pending.length}</Badge>
            </div>
            {pending.map(renderAppointment)}
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Próximos</h2>
            </div>
            {upcoming.map(renderAppointment)}
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              Histórico
            </h2>
            {past.map(renderAppointment)}
          </div>
        )}

        {pending.length === 0 && upcoming.length === 0 && past.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum agendamento ainda</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Faça seu primeiro agendamento!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientLayout>
  )
}
