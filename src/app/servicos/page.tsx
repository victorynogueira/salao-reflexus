'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Scissors, Plus, Search, Edit, Trash2, Clock, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  commission: number
  category: string
  active: boolean
}

const CATEGORIES = [
  'Corte',
  'Coloração',
  'Escova',
  'Tratamento',
  'Manicure/Pedicure',
  'Sobrancelha',
  'Maquiagem',
  'Barba',
  'Outros',
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '30',
    price: '',
    commission: '0',
    category: 'Corte',
  })

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter) params.set('category', categoryFilter)
      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      setServices(data)
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, categoryFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowNewModal(false)
        setFormData({ name: '', description: '', duration: '30', price: '', commission: '0', category: 'Corte' })
        fetchServices()
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' })
      fetchServices()
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
    }
  }

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = []
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Serviços</h1>
            <p className="text-gray-500 dark:text-gray-400">{services.length} serviços cadastrados</p>
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus size={18} />
            Novo Serviço
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[{ value: '', label: 'Todas Categorias' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
            className="sm:w-48"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Scissors size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum serviço encontrado</p>
              <Button onClick={() => setShowNewModal(true)} className="mt-4">
                <Plus size={18} />
                Cadastrar Primeiro Serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedServices).map(([category, categoryServices]) => (
            <Card key={category}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryServices.map((service) => (
                    <div key={service.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{service.name}</h4>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            {service.duration}min
                          </span>
                          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                            <DollarSign size={14} />
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Novo Serviço" size="lg">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <Input
            label="Nome do Serviço"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Descrição"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duração (minutos)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Comissão (R$)"
              type="number"
              step="0.01"
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
            />
            <Select
              label="Categoria"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus size={18} />
              Cadastrar
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
