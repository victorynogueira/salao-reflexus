'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Users, Plus, Search, Phone, Trash2, Eye, Copy, Key, MessageCircle, Send, User, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatPhone, formatDate } from '@/utils/format'

interface Client {
  id: string
  name: string
  phone: string
  username: string
  notes: string | null
  active: boolean
  mustChangePassword?: boolean
  createdAt: string
  updatedAt?: string
  _count?: { appointments: number }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [createdClient, setCreatedClient] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' })
  const [toast, setToast] = useState('')

  const fetchClients = async (searchTerm = '') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients?search=${searchTerm}`)
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const data = await res.json()
        setCreatedClient(data)
        setFormData({ name: '', phone: '', notes: '' })
        fetchClients(search)
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      fetchClients(search)
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
    }
  }

  const sendCredentialsWhatsApp = (client: Client) => {
    const phone = client.phone.replace(/\D/g, '')
    const message = `Olá, ${client.name}! 🌸\n\nSeus dados de acesso ao Salão Reflexus:\n\n👤 Usuário: *${client.username}*\n🔗 Acesse: https://salao-reflexus.vercel.app/cliente\n\nQualquer dúvida, estamos à disposição! 💕`
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const copyUsername = (username: string) => {
    navigator.clipboard.writeText(username)
    setToast('Usuário copiado!')
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
            <p className="text-gray-500 dark:text-gray-400">{clients.length} clientes cadastrados</p>
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus size={18} />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum cliente encontrado</p>
              <Button onClick={() => setShowNewModal(true)} className="mt-4">
                <Plus size={18} />
                Cadastrar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {clients.map((client) => (
              <Card key={client.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{client.name}</p>
                          {client.mustChangePassword && (
                            <Badge variant="warning">Trocar senha</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Phone size={12} />
                            {formatPhone(client.phone)}
                          </span>
                          <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                            @{client.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {formatDate(client.createdAt)}
                          </span>
                          {client._count?.appointments !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {client._count.appointments} agendamento{client._count.appointments !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                      <Link href={`/clientes/${client.id}`}>
                        <Button variant="ghost" size="sm" title="Ver detalhes">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => sendCredentialsWhatsApp(client)} title="Enviar login via WhatsApp">
                        <MessageCircle size={16} className="text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyUsername(client.username)} title="Copiar usuário">
                        <Copy size={16} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)} title="Excluir">
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showNewModal} onClose={() => { setShowNewModal(false); setCreatedClient(null) }} title="Novo Cliente">
        {createdClient ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-2">Cliente cadastrado com sucesso!</p>
              <p className="text-sm text-green-600 dark:text-green-500 mb-3">Envie estas credenciais para a cliente:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-500">Usuario</p>
                    <p className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">@{createdClient.username}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(createdClient.username); setToast('Copiado!') }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Copy size={16} className="text-gray-400" />
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500">Senha temporária</p>
                      <p className="font-mono font-bold text-lg text-yellow-700 dark:text-yellow-400">{createdClient.password}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(createdClient.password); setToast('Copiado!') }} className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                      <Copy size={16} className="text-yellow-500" />
                    </button>
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">A cliente deverá trocar a senha no primeiro acesso.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const phone = createdClient.phone.replace(/\D/g, '')
                const message = `Olá, ${createdClient.name}! 🌸\n\nSeu cadastro no Salão Reflexus foi realizado com sucesso!\n\n🔐 *Seus dados de acesso:*\n👤 Usuário: *${createdClient.username}*\n🔑 Senha: *${createdClient.password}*\n\nAcesse: https://salao-reflexus.vercel.app/cliente\n\n⚠️ No primeiro acesso, você deverá trocar a senha.\n\nQualquer dúvida, estamos à disposição! 💕`
                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank')
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={18} />
              Enviar via WhatsApp
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowNewModal(false); setCreatedClient(null) }}>
                Fechar
              </Button>
              <Button className="flex-1" onClick={() => setCreatedClient(null)}>
                <Plus size={18} />
                Novo Cliente
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <Input
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Telefone (WhatsApp)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              required
            />
            <textarea
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Observacoes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Send size={18} />
                Cadastrar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </DashboardLayout>
  )
}
