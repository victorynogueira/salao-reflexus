'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import {
  Plus,
  Search,
  User,
  Clock,
  DollarSign,
  Check,
  Trash2,
  Calendar,
  Scissors,
} from 'lucide-react'
import { format, parse } from 'date-fns'
import { formatCurrency, calculateEndTime, calculateDuration, generateTimeSlots } from '@/utils/format'

interface Client {
  id: string
  name: string
  phone: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  commission: number
  category: string
}

interface Professional {
  id: string
  name: string
}

export default function AgendamentoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')

  const [searchClient, setSearchClient] = useState('')
  const [searchService, setSearchService] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({ name: '', phone: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
      fetch('/api/professionals').then(r => r.json()),
    ]).then(([c, s, p]) => {
      setClients(c)
      setServices(s)
      setProfessionals(p)
      setLoading(false)
    })
  }, [])

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const endTime = selectedTime ? calculateEndTime(selectedTime, totalDuration) : ''
  const availableSlots = generateTimeSlots('08:00', '20:00', 15)

  const handleAddService = (service: Service) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service])
    }
  }

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId))
  }

  const handleCreateNewClient = async () => {
    if (!newClientData.name || !newClientData.phone) return
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData),
      })
      if (res.ok) {
        const client = await res.json()
        setSelectedClient(client)
        setShowNewClientForm(false)
        setShowClientModal(false)
        fetch('/api/clients').then(r => r.json()).then(setClients)
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient?.id,
          professionalId: selectedProfessional,
          date: selectedDate,
          startTime: selectedTime,
          endTime,
          services: selectedServices.map(s => ({
            serviceId: s.id,
            price: s.price,
            commission: s.commission,
            duration: s.duration,
          })),
          notes,
          totalPrice,
          totalDuration,
        }),
      })

      if (res.ok) {
        router.push('/agenda')
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    }
  }

  const steps = [
    { num: 1, label: 'Cliente' },
    { num: 2, label: 'Serviços' },
    { num: 3, label: 'Data/Hora' },
    { num: 4, label: 'Confirmar' },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Novo Agendamento</h1>
          <p className="text-gray-500 dark:text-gray-400">Preencha as informações para agendar</p>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                step >= s.num
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${
                step >= s.num ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Selecionar Cliente</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar cliente por nome ou telefone..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="pl-10"
                  onClick={() => setShowClientModal(true)}
                  readOnly
                />
              </div>

              {selectedClient && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedClient.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.phone}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(null); setSearchClient('') }}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              )}

              <Button onClick={() => setShowClientModal(true)} className="w-full" variant="secondary">
                <Search size={18} />
                Buscar Cliente
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Selecionar Serviços</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar serviço..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
              />

              <div className="grid gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto scrollbar-thin">
                {services
                  .filter(s => s.name.toLowerCase().includes(searchService.toLowerCase()))
                  .map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleAddService(service)}
                      disabled={!!selectedServices.find(s => s.id === service.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                        selectedServices.find(s => s.id === service.id)
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{service.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{service.duration} min</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(service.price)}</span>
                    </button>
                  ))}
              </div>

              {selectedServices.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Serviços Selecionados</h4>
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Scissors size={16} className="text-primary-600" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{service.duration}min</span>
                        <span className="text-sm font-medium text-green-600">{formatCurrency(service.price)}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveService(service.id)}>
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-500"><Clock size={14} /> {totalDuration} min</span>
                      <span className="flex items-center gap-1 text-green-600 font-medium"><DollarSign size={14} /> {formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data, Horário e Profissional</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Data"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />

              <Select
                label="Profissional"
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                options={[{ value: '', label: 'Selecione um profissional' }, ...professionals.map(p => ({ value: p.id, label: p.name }))]}
              />

              <div>
                <label className="label-field">Horário Disponível</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTime === slot
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTime && totalDuration > 0 && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <Clock size={16} className="inline mr-1" />
                    Horário: {selectedTime} às {endTime} ({totalDuration} minutos)
                  </p>
                </div>
              )}

              <textarea
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Observações (opcional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirmar Agendamento</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Cliente</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{selectedClient?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Data</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(selectedDate), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Horário</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{selectedTime} - {endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Profissional</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {professionals.find(p => p.id === selectedProfessional)?.name}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Serviços</h4>
                {selectedServices.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(totalPrice)}</span>
              </div>

              {notes && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Observações:</p>
                  {notes}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => router.push('/agenda')}>
              Cancelar
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !selectedClient) ||
                (step === 2 && selectedServices.length === 0) ||
                (step === 3 && (!selectedTime || !selectedProfessional))
              }
            >
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check size={18} />
              Confirmar Agendamento
            </Button>
          )}
        </div>
      </div>

      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)} title="Selecionar Cliente" size="lg">
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar cliente..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setShowNewClientForm(true)}>
              <Plus size={18} />
              Novo
            </Button>
          </div>

          {showNewClientForm && (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Novo Cliente</h4>
              <Input
                label="Nome"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
              />
              <Input
                label="Telefone"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateNewClient}>Salvar</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowNewClientForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2">
            {clients
              .filter(c =>
                c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
                c.phone.includes(searchClient)
              )
              .map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client)
                    setSearchClient(client.name)
                    setShowClientModal(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-semibold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
