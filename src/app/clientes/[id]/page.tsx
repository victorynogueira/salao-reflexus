'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, Clock, MessageCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatPhone, getWhatsAppLink } from '@/utils/format'

interface ClientDetail {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  active: boolean
  createdAt: string
  appointments: {
    id: string
    date: string
    startTime: string
    endTime: string
    status: string
    totalPrice: number
    paid: boolean
    notes: string | null
    professional: { name: string }
    services: {
      service: { name: string; price: number }
      price: number
    }[]
  }[]
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Cliente não encontrado</p>
          <Button onClick={() => router.push('/clientes')} className="mt-4">
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const totalSpent = client.appointments
    .filter(a => a.status === 'COMPLETED' && a.paid)
    .reduce((sum, a) => sum + a.totalPrice, 0)

  const whatsappLink = getWhatsAppLink(client.phone, `Olá ${client.name}! Aqui é do Salão Reflexus.`)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/clientes')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{client.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">Histórico do Cliente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{client.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cliente desde {formatDate(client.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone size={18} />
                    <span>{formatPhone(client.phone)}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Mail size={18} />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.notes && (
                    <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">Observações:</p>
                      {client.notes}
                    </div>
                  )}
                </div>

                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-4 w-full">
                  <Button className="w-full">
                    <MessageCircle size={18} />
                    Enviar WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={18} />
                      <span>Atendimentos</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{client.appointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign size={18} />
                      <span>Total Gasto</span>
                    </div>
                    <span className="font-semibold text-green-600">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={18} />
                      <span>Última Visita</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {client.appointments[0] ? formatDate(client.appointments[0].date) : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Histórico de Atendimentos</h3>
              </CardHeader>
              <CardContent>
                {client.appointments.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum atendimento registrado</p>
                ) : (
                  <div className="space-y-4">
                    {client.appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(appointment.date)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {appointment.startTime} - {appointment.endTime}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                appointment.status === 'COMPLETED' ? 'success' :
                                appointment.status === 'CANCELLED' ? 'danger' :
                                appointment.status === 'SCHEDULED' ? 'info' : 'warning'
                              }
                            >
                              {appointment.status === 'COMPLETED' ? 'Concluído' :
                               appointment.status === 'CANCELLED' ? 'Cancelado' :
                               appointment.status === 'SCHEDULED' ? 'Agendado' :
                               appointment.status === 'CONFIRMED' ? 'Confirmado' :
                               appointment.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Não Compareceu'}
                            </Badge>
                            {appointment.paid && <Badge variant="success">Pago</Badge>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {appointment.services.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{s.service.name}</span>
                              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(s.price)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Profissional</span>
                            <span className="text-gray-600 dark:text-gray-400">{appointment.professional.name}</span>
                          </div>
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-gray-900 dark:text-gray-100">Total</span>
                            <span className="text-green-600">{formatCurrency(appointment.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
