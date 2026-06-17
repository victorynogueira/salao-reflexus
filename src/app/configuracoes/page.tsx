'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, Bell, Shield, User, Store, Plus, MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [salonName, setSalonName] = useState('Salão Reflexus')
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '20:00' })
  const [slotInterval, setSlotInterval] = useState('30')

  const [whatsappPhoneId, setWhatsappPhoneId] = useState('')
  const [whatsappToken, setWhatsappToken] = useState('')
  const [whatsappTestPhone, setWhatsappTestPhone] = useState('')
  const [whatsappTesting, setWhatsappTesting] = useState(false)
  const [whatsappTestResult, setWhatsappTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [whatsappConfigured, setWhatsappConfigured] = useState(false)

  useEffect(() => {
    fetch('/api/config/whatsapp')
      .then(r => r.json())
      .then(data => {
        setWhatsappConfigured(data.configured || false)
      })
      .catch(() => setWhatsappConfigured(false))
  }, [])

  const testWhatsApp = async () => {
    setWhatsappTesting(true)
    setWhatsappTestResult(null)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: whatsappTestPhone,
          message: 'Teste do Salão Reflexus ✅\n\nWhatsApp configurado com sucesso!',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setWhatsappTestResult({ success: true, message: 'Mensagem enviada com sucesso!' })
        setWhatsappConfigured(true)
      } else {
        setWhatsappTestResult({ success: false, message: data.error || 'Erro ao enviar' })
      }
    } catch {
      setWhatsappTestResult({ success: false, message: 'Erro ao conectar' })
    } finally {
      setWhatsappTesting(false)
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
              <MessageCircle size={20} />
              WhatsApp Cloud API
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {whatsappConfigured && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-400">WhatsApp configurado e funcionando!</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">Configure aqui sua integração com a Meta WhatsApp Cloud API:</p>
              <ol className="text-xs text-blue-600 dark:text-blue-500 list-decimal list-inside space-y-1">
                <li>Crie um app em <a href="https://developers.facebook.com" target="_blank" className="underline">developers.facebook.com</a></li>
                <li>Adicione o produto WhatsApp</li>
                <li>Copie o Phone Number ID e o Access Token</li>
                <li>Cole abaixo e teste</li>
              </ol>
            </div>

            <Input
              label="Phone Number ID"
              value={whatsappPhoneId}
              onChange={(e) => setWhatsappPhoneId(e.target.value)}
              placeholder="Ex: 123456789012345"
            />
            <Input
              label="Access Token (Permanent)"
              type="password"
              value={whatsappToken}
              onChange={(e) => setWhatsappToken(e.target.value)}
              placeholder="EAA..."
            />
            <Input
              label="Número para Teste (com DDD)"
              value={whatsappTestPhone}
              onChange={(e) => setWhatsappTestPhone(e.target.value)}
              placeholder="5511999999999"
            />
            <Button onClick={testWhatsApp} loading={whatsappTesting}>
              <MessageCircle size={18} />
              Testar Envio
            </Button>

            {whatsappTestResult && (
              <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                whatsappTestResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                {whatsappTestResult.success ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-red-600" />
                )}
                <p className={`text-sm ${
                  whatsappTestResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {whatsappTestResult.message}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Após configurar, adicione as variáveis no Vercel: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code> e <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code>
            </p>
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
