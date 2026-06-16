'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
  LogOut,
  Plus,
} from 'lucide-react'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, generateTimeSlots } from '@/utils/format'
import { format, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
}

interface Appointment {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
}

export default function ClientBookPage() {
  const [client, setClient] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedTime, setSelectedTime] = useState('')
  const [rosaPhone, setRosaPhone] = useState('5511999999999')
  const [booked, setBooked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const user = localStorage.getItem('client-user')
    if (!token || !user) {
      router.push('/cliente')
      return
    }
    setClient(JSON.parse(user))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/professionals').then(r => r.json()),
    ]).then(([s, a, p]) => {
      setServices(Array.isArray(s) ? s : [])
      setAppointments(Array.isArray(a) ? a : [])
      if (Array.isArray(p) && p.length > 0 && p[0].whatsapp) {
        setRosaPhone(p[0].whatsapp.replace(/\D/g, ''))
      }
      setLoading(false)
    }).catch(() => {
      setServices([])
      setAppointments([])
      setLoading(false)
    })
  }, [])

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  const timeSlots = generateTimeSlots('08:00', '20:00', 30)

  const isSlotAvailable = (slot: string): boolean => {
    const slotEnd = calculateEnd(slot, totalDuration || 30)
    return !appointments.some(a => {
      if (new Date(a.date).toDateString() !== selectedDate.toDateString()) return false
      if (a.status === 'CANCELLED') return false
      return slot < a.endTime && slotEnd > a.startTime
    })
  }

  const calculateEnd = (start: string, duration: number): string => {
    const [h, m] = start.split(':').map(Number)
    const total = h * 60 + m + duration
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const handleBook = async () => {
    if (!selectedTime || selectedServices.length === 0 || !client) return

    setSubmitting(true)
    setBooked(false)

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dateDisplay = format(selectedDate, "dd/MM/yyyy")
    const serviceNames = selectedServices.map(s => s.name).join(', ')

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          date: dateStr,
          startTime: selectedTime,
          services: selectedServices.map(s => ({
            serviceId: s.id,
            price: s.price,
            commission: s.price * 0.7,
            duration: s.duration,
          })),
          notes: `Solicitação via WhatsApp - ${serviceNames}`,
          totalPrice,
          totalDuration,
          isClientRequest: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || `Erro ao criar solicitação (HTTP ${res.status})`)
        setSubmitting(false)
        return
      }

      const message = `Olá, Rosa! Sou ${client.name} e gostaria de agendar:

📋 *Serviço:* ${serviceNames}
📅 *Data:* ${dateDisplay}
🕐 *Horário:* ${selectedTime}
⏱ *Duração:* ${totalDuration} minutos
💰 *Valor:* ${formatCurrency(totalPrice)}

Esse horário está disponível?`

      const encoded = encodeURIComponent(message)
      window.open(`https://wa.me/${rosaPhone}?text=${encoded}`, '_blank')

      setBooked(true)
      setTimeout(() => {
        setBooked(false)
        router.push('/cliente/meus-agendamentos')
      }, 2000)
    } catch {
      alert('Erro ao conectar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client-token')
    localStorage.removeItem('client-user')
    router.push('/cliente')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
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
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Scissors size={18} className="text-primary-600" />
              Escolha os Serviços
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {services.map((service) => {
                const isSelected = selectedServices.find(s => s.id === service.id)
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServices(selectedServices.filter(s => s.id !== service.id))
                      } else {
                        setSelectedServices([...selectedServices, service])
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(service.price)}</p>
                      <p className="text-xs text-gray-500">{service.duration} min</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {selectedServices.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-primary-600" />
                Escolha o Dia
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {next7Days.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => { setSelectedDate(date); setSelectedTime('') }}
                    className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-colors ${
                      isSameDay(date, selectedDate)
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <p className="text-xs font-medium">{format(date, 'EEE', { locale: ptBR }).slice(0, 3)}</p>
                    <p className="text-lg font-bold">{format(date, 'dd')}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedServices.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                Escolha o Horário
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                {timeSlots.map((slot) => {
                  const available = isSlotAvailable(slot)
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      disabled={!available}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        !available
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedServices.length > 0 && selectedTime && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Resumo</h3>
              {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(s.price)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(totalPrice)}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                📅 {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                {' '}({totalDuration} min)
              </p>

              <Button
                onClick={handleBook}
                className={`w-full ${booked ? 'bg-green-600' : ''}`}
                size="lg"
                loading={submitting}
              >
                {booked ? (
                  <>
                    <Check size={20} />
                    Solicitação Enviada!
                  </>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    Solicitar via WhatsApp
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                A Rosa receberá sua solicitação e confirmará pelo WhatsApp.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
