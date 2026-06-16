'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, Bell, Shield, User, Store, Plus } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [salonName, setSalonName] = useState('Salão Reflexus')
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '20:00' })
  const [slotInterval, setSlotInterval] = useState('30')

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
            <Input
              label="Nome do Salão"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Horário de Abertura"
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
              />
              <Input
                label="Horário de Fechamento"
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
              />
            </div>
            <Select
              label="Intervalo entre Horários"
              value={slotInterval}
              onChange={(e) => setSlotInterval(e.target.value)}
              options={[
                { value: '15', label: '15 minutos' },
                { value: '30', label: '30 minutos' },
                { value: '45', label: '45 minutos' },
                { value: '60', label: '1 hora' },
              ]}
            />
            <Button>Salvar Alterações</Button>
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
