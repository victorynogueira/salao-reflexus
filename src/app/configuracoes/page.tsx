'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, Bell, Shield, User, Store, Plus, Save, Loader2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [slotInterval, setSlotInterval] = useState('30')

  const [salonData, setSalonData] = useState({ name: '', address: '', phone: '' })
  const [salonSaving, setSalonSaving] = useState(false)
  const [salonSaved, setSalonSaved] = useState(false)

  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '20:00' })

  useEffect(() => {
    fetch('/api/config/salon')
      .then(r => r.json())
      .then(data => {
        setSalonData({ name: data.name || '', address: data.address || '', phone: data.phone || '' })
      })
      .catch(() => {})
  }, [])

  const saveSalonConfig = async () => {
    setSalonSaving(true)
    try {
      await fetch('/api/config/salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salonData),
      })
      setSalonSaved(true)
      setTimeout(() => setSalonSaved(false), 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setSalonSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie as configurações do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Store size={20} />
              Dados do Salão
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {salonSaved && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
                Dados salvos com sucesso!
              </div>
            )}
            <Input
              label="Nome do Salão"
              value={salonData.name}
              onChange={(e) => setSalonData({ ...salonData, name: e.target.value })}
              placeholder="Ex: Salão Reflexus"
            />
            <Input
              label="Endereço"
              value={salonData.address}
              onChange={(e) => setSalonData({ ...salonData, address: e.target.value })}
              placeholder="Rua, Número, Bairro"
            />
            <Input
              label="Telefone"
              value={salonData.phone}
              onChange={(e) => setSalonData({ ...salonData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
            <div className="flex items-center justify-between pt-2">
              <Button onClick={saveSalonConfig} loading={salonSaving}>
                <Save size={18} />
                Salvar Dados do Salão
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sun size={20} />
              Aparência
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Modo Escuro</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alterne entre o tema claro e escuro</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bell size={20} />
              Notificações
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Notificações por WhatsApp</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enviar lembretes automáticos para clientes</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield size={20} />
              Profissionais
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button>
              <Plus size={18} />
              Adicionar Profissional
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User size={20} />
              Minha Conta
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Nome" placeholder="Seu nome" />
            <Input label="Email" type="email" placeholder="seu@email.com" />
            <Input label="Nova Senha" type="password" placeholder="Nova senha" />
            <Button>Atualizar Conta</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
