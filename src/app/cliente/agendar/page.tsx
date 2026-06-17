'use client'

import { useState, useEffect } from 'react'
import ClientPortalLayout from '@/components/layout/ClientPortalLayout'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Calendar, Clock, Scissors, Check, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [dateOffset, setDateOffset] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const user = localStorage.getItem('client-user')
    if (!token || !user) return
    setClient(JSON.parse(user))

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

  const displayDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + dateOffset))

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

  const availableSlots = timeSlots.filter(slot => isSlotAvailable(slot))

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

      const message = `Olá, Rosa! Sou ${client.name} e gostaria de agendar:\n\n📋 *Serviço:* ${serviceNames}\n📅 *Data:* ${dateDisplay}\n🕐 *Horário:* ${selectedTime}\n⏱ *Duração:* ${totalDuration} minutos\n💰 *Valor:* ${formatCurrency(totalPrice)}\n\nEsse horário está disponível?`

      const encoded = encodeURIComponent(message)
      window.open(`https://wa.me/${rosaPhone}?text=${encoded}`, '_blank')

      setBooked(true)
      setSelectedTime('')
      setSelectedServices([])
    } catch {
      alert('Erro ao conectar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <ClientPortalLayout activeTab="agendar">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Scissors size={18} className="text-primary-600" />
              Escolha os Serviços
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
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
                      setSelectedTime('')
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.category} · {service.duration} min</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-green-600">{formatCurrency(service.price)}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {selectedServices.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  Escolha o Dia
                </h3>
                <div className="flex gap-1">
                  {dateOffset > 0 && (
                    <button onClick={() => { setDateOffset(d => d - 7); setSelectedTime('') }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <ChevronLeft size={16} className="text-gray-500" />
                    </button>
                  )}
                  <button onClick={() => { setDateOffset(d => d + 7); setSelectedTime('') }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronRight size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {displayDays.map((date) => {
                  const isSunday = date.getDay() === 0
                  return (
                    <button
                      key={date.toISOString()}
                      disabled={isSunday}
                      onClick={() => { setSelectedDate(date); setSelectedTime('') }}
                      className={`flex-shrink-0 w-14 py-3 rounded-xl text-center transition-all ${
                        isSunday
                          ? 'opacity-40 cursor-not-allowed'
                          : isSameDay(date, selectedDate)
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <p className="text-[10px] font-medium uppercase">{format(date, 'EEE', { locale: ptBR }).slice(0, 3)}</p>
                      <p className="text-lg font-bold">{format(date, 'dd')}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedServices.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                Horários Disponíveis
              </h3>
              {availableSlots.length === 0 ? (
                <div className="py-6 text-center">
                  <Clock size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum horário disponível</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tente outro dia</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md scale-105'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedServices.length > 0 && selectedTime && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Resumo</h3>
                <Badge variant="info">{totalDuration} min</Badge>
              </div>
              {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(s.price)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Total</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📅 {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedTime}</span>
                </p>
              </div>

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

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                A Rosa receberá sua solicitação e confirmará pelo WhatsApp.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientPortalLayout>
  )
}
