'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Scissors,
  LogOut,
  ArrowLeft,
  Check,
  MessageCircle,
} from 'lucide-react'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { format, addDays, isSunday, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getWhatsAppLink, formatCurrency } from '@/utils/format'

const ROSA_WHATSAPP = process.env.NEXT_PUBLIC_ROSA_WHATSAPP || '5500000000000'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
  active: boolean
  priceToConfirm?: boolean
}

interface Appointment {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
}

export default function RequestAppointmentPage() {
  const [client, setClient] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedTime, setSelectedTime] = useState('')
  const [step, setStep] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const user = localStorage.getItem('client-user')
    if (!token || !user) { router.push('/cliente'); return }
    setClient(JSON.parse(user))

    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/professionals').then(r => r.json()),
    ]).then(([services, professionals]) => {
      setServices(services.filter((s: Service) => s.active))
      if (professionals.length > 0) {
        fetch(`/api/appointments?professionalId=${professionals[0].id}`)
          .then(r => r.json())
          .then(setAppointments)
      }
      setLoading(false)
    })
  }, [])

  const totalDuration = selectedServices.reduce((s, sv) => s + sv.duration, 0)
  const servicesWithFixedPrice = selectedServices.filter(s => !s.priceToConfirm)
  const totalPrice = servicesWithFixedPrice.reduce((s, sv) => s + sv.price, 0)
  const hasPriceToConfirm = selectedServices.some(s => s.priceToConfirm)

  const getAvailableSlots = () => {
    if (!selectedDate || totalDuration === 0) return []

    const dayAppts = appointments.filter(a => new Date(a.date).toDateString() === new Date(selectedDate).toDateString() && a.status !== 'CANCELLED')

    const slots: string[] = []
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        const slotMinutes = h * 60 + m
        const endMinutes = slotMinutes + totalDuration

        const conflict = dayAppts.find(a => {
          const [ah, am] = a.startTime.split(':').map(Number)
          const [eh, em] = a.endTime.split(':').map(Number)
          const aStart = ah * 60 + am
          const aEnd = eh * 60 + em
          return slotMinutes < aEnd && endMinutes > aStart
        })

        if (!conflict) slots.push(slot)
      }
    }
    return slots
  }

  const availableSlots = getAvailableSlots()

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i)
    if (isSunday(d)) return null
    return {
      date: format(d, 'yyyy-MM-dd'),
      day: format(d, 'dd'),
      weekday: format(d, 'EEE', { locale: ptBR }),
    }
  }).filter(Boolean)

  const handleRequest = () => {
    if (!client || !selectedDate || !selectedTime || selectedServices.length === 0) return

    const servicesList = selectedServices.map(s => `• ${s.name} (${s.duration}min)`).join('\n')
    const dateFormatted = format(new Date(selectedDate + 'T00:00:00'), "dd/MM/yyyy")

    const message = `Olá Rosa! Sou ${client.name}.\n\nGostaria de saber se o horario abaixo esta disponivel:\n\n📅 Data: ${dateFormatted}\n⏰ Horario: ${selectedTime}\n\nServiços:\n${servicesList}\n\n⏱️ Duracao total: ${totalDuration}min\n💰 Valor: ${formatCurrency(totalPrice)}`

    window.open(getWhatsAppLink(ROSA_WHATSAPP, message), '_blank')
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
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/cliente/meus-agendamentos')} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Solicitar Agendamento</h1>
            <p className="text-white/80 text-sm">Passo {step} de 3</p>
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Scissors size={20} className="text-primary-600" />
              Escolha os Serviços
            </h2>
            <div className="space-y-2">
              {services.filter(s => s.active).map((service) => {
                const isSelected = selectedServices.find(s => s.id === service.id)
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      if (isSelected) setSelectedServices(selectedServices.filter(s => s.id !== service.id))
                      else setSelectedServices([...selectedServices, service])
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{service.name}</p>
                        <p className="text-sm text-gray-500">{service.duration} min</p>
                      </div>
                    </div>
                    {service.priceToConfirm ? (
                      <Badge variant="info">Preço a confirmar</Badge>
                    ) : (
                      <span className="font-semibold text-green-600">{formatCurrency(service.price)}</span>
                    )}
                  </button>
                )
              })}
            </div>

              {selectedServices.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{selectedServices.length} serviço(s) • {totalDuration}min</span>
                  {hasPriceToConfirm ? (
                    <span className="font-semibold text-gray-500">Preço a confirmar</span>
                  ) : (
                    <span className="font-bold text-green-600">{formatCurrency(totalPrice)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Calendar size={20} className="text-primary-600" />
              Escolha a Data
            </h2>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {dates.map((d, i) => d && (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d.date)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === d.date
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <p className="text-xs text-gray-500 uppercase">{d.weekday}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{d.day}</p>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Clock size={20} className="text-primary-600" />
                  Horarios Disponiveis
                </h2>
                {availableSlots.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Nenhum horario disponivel nesta data</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === slot
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Confirmar Solicitacao</h2>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Cliente:</span> <strong>{client?.name}</strong></p>
                  <p className="text-sm"><span className="text-gray-500">Data:</span> <strong>{format(new Date(selectedDate + 'T00:00:00'), "dd/MM/yyyy")}</strong></p>
                  <p className="text-sm"><span className="text-gray-500">Horario:</span> <strong>{selectedTime}</strong></p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Servicos:</p>
                  {selectedServices.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600 dark:text-gray-400">{s.name} ({s.duration}min)</span>
                      {s.priceToConfirm ? (
                        <Badge variant="info">Preço a confirmar</Badge>
                      ) : (
                        <span>{formatCurrency(s.price)}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  {hasPriceToConfirm ? (
                    <span className="text-gray-500">A confirmar</span>
                  ) : (
                    <span className="text-green-600">{formatCurrency(totalPrice)}</span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-400">
                  Ao clicar no botao abaixo, uma mensagem sera enviada para o WhatsApp da Rosa perguntando se o horario esta disponivel.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto flex gap-3">
          {step < 3 ? (
            <Button
              className="flex-1"
              disabled={
                (step === 1 && selectedServices.length === 0) ||
                (step === 2 && (!selectedDate || !selectedTime))
              }
              onClick={() => setStep(step + 1)}
            >
              Proximo
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleRequest}>
              <MessageCircle size={18} />
              Solicitar via WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
