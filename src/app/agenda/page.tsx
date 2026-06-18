'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  Edit,
  Trash2,
  MessageCircle,
  Check,
  Bell,
} from 'lucide-react'
import { format, parse, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, formatPhone, getWhatsAppLink, generateTimeSlots } from '@/utils/format'

interface Appointment {
  id: string
  clientId: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  paid: boolean
  notes: string | null
  client: { name: string; phone: string }
  professional: { id: string; name: string }
  services: { service: { name: string; price: number }; priceToConfirm?: boolean }[]
}

interface Professional {
  id: string
  name: string
}

export default function AgendaPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderSending, setReminderSending] = useState(false)
  const [reminderSent, setReminderSent] = useState<string[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('date', format(currentDate, 'yyyy-MM-dd'))
      if (selectedProfessional) params.set('professionalId', selectedProfessional)
      const res = await fetch(`/api/appointments?${params}`)
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data.filter((a: any) => a.status !== 'CANCELLED') : [])
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/appointments?status=PENDING')
      const data = await res.json()
      setPendingCount(Array.isArray(data) ? data.length : 0)
    } catch {}
  }

  const fetchProfessionals = async () => {
    try {
      const res = await fetch('/api/professionals')
      const data = await res.json()
      setProfessionals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
      setProfessionals([])
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchProfessionals()
    fetchPending()
  }, [currentDate, selectedProfessional])

  const handlePrev = () => {
    if (view === 'day') setCurrentDate(prev => subDays(prev, 1))
    else if (view === 'week') setCurrentDate(prev => subDays(prev, 7))
    else setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNext = () => {
    if (view === 'day') setCurrentDate(prev => addDays(prev, 1))
    else if (view === 'week') setCurrentDate(prev => addDays(prev, 7))
    else setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleCancel = async () => {
    if (!selectedAppointment) return
    try {
      await fetch(`/api/appointments/${selectedAppointment.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      setShowCancelModal(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error) {
      console.error('Erro ao cancelar:', error)
    }
  }

  const todayAppointments = appointments.filter(a =>
    a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  )

  const handleSendReminders = async () => {
    setReminderSending(true)
    const sent: string[] = []
    for (const appt of todayAppointments) {
      const message = `Olá ${appt.client.name}! Lembrete do seu horário hoje às ${appt.startTime} no Salão Reflexus. Confirmamos sua presença? 😊`
      window.open(getWhatsAppLink(appt.client.phone, message), '_blank')
      sent.push(appt.id)
      setReminderSent([...sent])
      await new Promise(r => setTimeout(r, 800))
    }
    setReminderSending(false)
  }

  const timeSlots = generateTimeSlots('08:00', '20:00', 30)

  const getAppointmentForSlot = (slot: string, professionalId?: string) => {
    return appointments.find(a => {
      if (professionalId && a.professional.id !== professionalId) return false
      return a.startTime <= slot && a.endTime > slot
    })
  }

  const isSlotStart = (slot: string, professionalId?: string) => {
    return appointments.find(a => {
      if (professionalId && a.professional.id !== professionalId) return false
      return a.startTime === slot
    })
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    IN_PROGRESS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels: Record<string, string> = {
    PENDING: '⏳ Pendente',
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  }

  const dates = view === 'week'
    ? eachDayOfInterval({ start: startOfWeek(currentDate, { locale: ptBR }), end: endOfWeek(currentDate, { locale: ptBR }) })
    : view === 'day'
    ? [currentDate]
    : []

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {pendingCount > 0 && (
          <Card className="border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center animate-pulse">
                  <Bell size={20} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                    {pendingCount} Solicitação(ões) Pendente(s)
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Confirme ou recuse os agendamentos abaixo.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const pending = appointments.filter(a => a.status === 'PENDING')
                    if (pending.length > 0) {
                      setSelectedAppointment(pending[0])
                      setShowDetailsModal(true)
                    }
                  }}
                >
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Agenda</h1>
          <div className="flex items-center gap-2">
            {todayAppointments.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setShowReminderModal(true)}>
                <MessageCircle size={16} />
                <span className="hidden sm:inline ml-1">Lembrar</span>
              </Button>
            )}
            <Button onClick={() => router.push('/agendamento')} size="sm">
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Agendamento</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <Button variant="secondary" size="sm" onClick={handlePrev} className="shrink-0">
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 text-center truncate">
              {view === 'month'
                ? format(currentDate, "MMMM 'yy", { locale: ptBR })
                : view === 'week'
                ? `${format(dates[0], 'dd/MM')} - ${format(dates[dates.length - 1], 'dd/MM/yyyy')}`
                : format(currentDate, "dd/MM/yyyy")}
            </span>
            <Button variant="secondary" size="sm" onClick={handleNext} className="shrink-0">
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    view === v
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {v === 'day' ? 'Dia' : v === 'week' ? 'Sem' : 'Mês'}
                </button>
              ))}
            </div>
            <Select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              options={[{ value: '', label: 'Todos' }, ...professionals.map(p => ({ value: p.id, label: p.name }))]}
              className="w-28 sm:w-40"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : view === 'month' ? (
          <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border-x">
            <CardContent className="p-0 sm:p-4">
              <div className="grid grid-cols-7 gap-0 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-1 sm:py-2 border-b border-gray-200 dark:border-gray-700">{day}</div>
                ))}
                {eachDayOfInterval({
                  start: startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), { locale: ptBR }),
                  end: endOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), { locale: ptBR }),
                }).map((date, idx) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = isSameDay(date, new Date())
                  const dayAppointments = appointments.filter(a => isSameDay(parse(a.date, 'yyyy-MM-dd', new Date()), date))

                  return (
                    <div
                      key={idx}
                      className={`min-h-[32px] sm:min-h-[80px] p-0 sm:p-1 border-b border-r border-gray-100 dark:border-gray-800 ${
                        (idx + 1) % 7 === 0 ? 'border-r-0' : ''
                      } ${isCurrentMonth ? '' : 'opacity-40'} ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                    >
                      <span className={`text-[10px] sm:text-sm leading-none sm:leading-normal ${isToday ? 'font-bold text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {format(date, 'dd')}
                      </span>
                      {dayAppointments.slice(0, 2).map(a => (
                        <div
                          key={a.id}
                          className="hidden sm:block mt-1 text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: '#c026d320', color: '#c026d3' }}
                          onClick={() => { setSelectedAppointment(a); setShowDetailsModal(true) }}
                        >
                          {a.startTime} {a.client.name}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="hidden sm:block text-xs text-gray-500">+{dayAppointments.length - 2}</div>
                      )}
                      {dayAppointments.length > 0 && (
                        <div className="sm:hidden flex justify-center gap-[1px] mt-[1px]">
                          {dayAppointments.slice(0, 4).map((a, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: '#c026d3' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border-x">
            <CardContent className="p-0 sm:p-4 overflow-x-auto">
              <div className="min-w-[300px] sm:min-w-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(view === 'day' ? [currentDate] : dates).map((date) => (
                    <div key={date.toString()}>
                      {view === 'week' && (
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 sm:px-0 py-2 bg-gray-50 dark:bg-gray-800/50 sm:bg-transparent">
                          {format(date, "EEEE, dd/MM", { locale: ptBR })}
                        </h3>
                      )}
                      <div>
                        {timeSlots.map((slot) => {
                          const appt = getAppointmentForSlot(slot)
                          const isStart = isSlotStart(slot)
                          if (appt && !isStart) return null

                          return (
                            <div key={slot} className="flex items-center gap-1 sm:gap-3 px-1 sm:px-0 py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                              <span className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 w-10 sm:w-12 shrink-0 text-center">{slot}</span>
                              {appt ? (
                                <div
                                  className={`flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${statusColors[appt.status] || statusColors.SCHEDULED}`}
                                  onClick={() => { setSelectedAppointment(appt); setShowDetailsModal(true) }}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 sm:gap-2">
                                    <div className="min-w-0">
                                      <p className="font-medium text-xs sm:text-sm truncate">{appt.client.name}</p>
                                      <p className="text-[10px] sm:text-xs opacity-80 truncate hidden sm:block">{appt.services.map(s => s.service.name).join(', ')}</p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:flex-col sm:items-end shrink-0">
                                      <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">{appt.startTime}-{appt.endTime}</span>
                                      <Badge variant={appt.status === 'COMPLETED' ? 'success' : appt.status === 'CANCELLED' ? 'danger' : 'info'}>
                                        <span className="text-[9px] sm:text-xs">{statusLabels[appt.status]}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 text-[11px] sm:text-sm hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-500 cursor-pointer transition-colors text-center sm:text-left"
                                  onClick={() => router.push('/agendamento')}
                                >
                                  Disponível
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setSelectedAppointment(null) }} title="Detalhes do Agendamento">
        {selectedAppointment && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User size={24} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedAppointment.client.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatPhone(selectedAppointment.client.phone)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Data</span>
                <span className="font-medium">{format(parse(selectedAppointment.date, 'yyyy-MM-dd', new Date()), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400"><Clock size={14} /> Horário</span>
                <span className="font-medium">{selectedAppointment.startTime} - {selectedAppointment.endTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Profissional</span>
                <span className="font-medium">{selectedAppointment.professional.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <Badge variant={selectedAppointment.status === 'COMPLETED' ? 'success' : 'info'}>
                  {statusLabels[selectedAppointment.status]}
                </Badge>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Serviços</h4>
              {selectedAppointment.services.map((s, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600 dark:text-gray-400">{s.service.name}</span>
                  {s.priceToConfirm ? (
                    <Badge variant="info">Preço a confirmar</Badge>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(s.service.price)}</span>
                  )}
                </div>
              ))}
              <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                {selectedAppointment.services.some(s => s.priceToConfirm) ? (
                  <span className="text-gray-500">A confirmar</span>
                ) : (
                  <span className="text-green-600">{formatCurrency(selectedAppointment.totalPrice)}</span>
                )}
              </div>
              {selectedAppointment.services.some(s => s.priceToConfirm) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  * O valor final será definido no momento do atendimento
                </p>
              )}
            </div>

            {selectedAppointment.status === 'PENDING' && (
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-400">
                <p className="font-medium">⏳ Solicitação pendente de confirmação</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedAppointment(null)
                  window.dispatchEvent(new CustomEvent('open-chat', { detail: { clientId: selectedAppointment.clientId, clientName: selectedAppointment.client.name } }))
                }}
              >
                <MessageCircle size={18} />
                Chat
              </Button>
              <a
                href={getWhatsAppLink(selectedAppointment.client.phone, `Olá ${selectedAppointment.client.name}! ${selectedAppointment.status === 'PENDING' ? 'Sua solicitação' : 'Confirmando seu agendamento'} para ${format(parse(selectedAppointment.date, 'yyyy-MM-dd', new Date()), "dd/MM")} às ${selectedAppointment.startTime}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full">
                  <MessageCircle size={18} />
                  WhatsApp
                </Button>
              </a>
              {selectedAppointment.status === 'PENDING' && (
                <>
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      await fetch(`/api/appointments/${selectedAppointment.id}/action`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'confirm' }),
                      })
                      setShowDetailsModal(false)
                      setSelectedAppointment(null)
                      fetchAppointments()
                      fetchPending()
                    }}
                  >
                    <Check size={18} />
                    Confirmar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await fetch(`/api/appointments/${selectedAppointment.id}/action`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reject' }),
                      })
                      setShowDetailsModal(false)
                      setSelectedAppointment(null)
                      fetchAppointments()
                      fetchPending()
                    }}
                  >
                    <Trash2 size={18} />
                    Recusar
                  </Button>
                </>
              )}
              {(selectedAppointment.status === 'SCHEDULED' || selectedAppointment.status === 'CONFIRMED') && (
                <Button
                  className="flex-1"
                  onClick={async () => {
                    await fetch(`/api/appointments/${selectedAppointment.id}/action`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'complete' }),
                    })
                    setShowDetailsModal(false)
                    setSelectedAppointment(null)
                    fetchAppointments()
                  }}
                >
                  <Check size={18} />
                  Concluir
                </Button>
              )}
              {selectedAppointment.status !== 'CANCELLED' && selectedAppointment.status !== 'PENDING' && selectedAppointment.status !== 'COMPLETED' && (
                <Button variant="ghost" onClick={() => setShowCancelModal(true)}>
                  <Trash2 size={18} className="text-red-500" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancelar Agendamento" size="sm">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Tem certeza que deseja cancelar este agendamento?</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Não
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Sim, Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReminderModal} onClose={() => { setShowReminderModal(false); setReminderSent([]) }} title="Lembrar Clientes" size="lg">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {todayAppointments.length} cliente(s) para lembrar hoje:
          </p>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {todayAppointments.map(appt => (
              <div key={appt.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                reminderSent.includes(appt.id)
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{appt.client.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{appt.startTime} - {appt.services.map(s => s.service.name).join(', ')}</p>
                </div>
                {reminderSent.includes(appt.id) ? (
                  <Check size={16} className="text-green-600 shrink-0" />
                ) : (
                  <MessageCircle size={16} className="text-gray-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => { setShowReminderModal(false); setReminderSent([]) }}>
              Fechar
            </Button>
            <Button onClick={handleSendReminders} disabled={reminderSending}>
              <MessageCircle size={18} />
              {reminderSending ? 'Enviando...' : `Enviar ${todayAppointments.length} lembrete(s)`}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
