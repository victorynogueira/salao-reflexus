'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientPortalLayout from '@/components/layout/ClientPortalLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { User, Phone, AtSign, Key, Eye, EyeOff, LogOut, Check, Loader2, Save, Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/utils/format'

export default function ProfilePage() {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const user = localStorage.getItem('client-user')
    if (!token || !user) {
      router.push('/cliente')
      return
    }
    const u = JSON.parse(user)
    setClient(u)
    setNameValue(u.name)
    setPhoneValue(u.phone)
    setLoading(false)
  }, [])

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setSuccess(type === 'success' ? msg : '')
    setError(type === 'error' ? msg : '')
    setTimeout(() => { setSuccess(''); setError('') }, 3000)
  }

  const updateName = async () => {
    if (!nameValue.trim()) return
    setNameLoading(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue.trim() }),
      })
      if (res.ok) {
        const updated = await res.json()
        setClient({ ...client, name: updated.name })
        localStorage.setItem('client-user', JSON.stringify({ ...client, name: updated.name }))
        showMessage('Nome atualizado!')
        setEditingName(false)
      } else {
        showMessage('Erro ao atualizar', 'error')
      }
    } catch {
      showMessage('Erro ao conectar', 'error')
    } finally {
      setNameLoading(false)
    }
  }

  const updatePhone = async () => {
    if (!phoneValue.trim()) return
    setPhoneLoading(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneValue.trim() }),
      })
      if (res.ok) {
        const updated = await res.json()
        setClient({ ...client, phone: updated.phone })
        localStorage.setItem('client-user', JSON.stringify({ ...client, phone: updated.phone }))
        showMessage('Telefone atualizado!')
        setEditingPhone(false)
      } else {
        showMessage('Erro ao atualizar', 'error')
      }
    } catch {
      showMessage('Erro ao conectar', 'error')
    } finally {
      setPhoneLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 4) {
      showMessage('Mínimo 4 caracteres', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showMessage('Senhas não coincidem', 'error')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/client/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        showMessage(data.error || 'Erro ao alterar senha', 'error')
      } else {
        const updatedUser = { ...client, mustChangePassword: false }
        setClient(updatedUser)
        localStorage.setItem('client-user', JSON.stringify(updatedUser))
        showMessage('Senha alterada com sucesso!')
        setShowPasswordForm(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      showMessage('Erro ao conectar', 'error')
    } finally {
      setPasswordLoading(false)
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
    <ClientPortalLayout activeTab="perfil">
      <div className="space-y-4">
        {(success || error) && (
          <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <Check size={16} />
            {success || error}
          </div>
        )}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {client?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{client?.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{client?.username}</p>
                {client?.mustChangePassword && (
                  <Badge variant="warning" className="mt-1">Trocar senha</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User size={18} className="text-primary-600" />
              Dados Pessoais
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nome</label>
              {editingName ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={updateName} loading={nameLoading}>
                    <Save size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameValue(client.name) }}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{client?.name}</p>
                  <button onClick={() => setEditingName(true)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    Editar
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Telefone</label>
              {editingPhone ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={updatePhone} loading={phoneLoading}>
                    <Save size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingPhone(false); setPhoneValue(client.phone) }}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{client?.phone}</p>
                  <button onClick={() => setEditingPhone(true)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    Editar
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Usuário</label>
                <div className="flex items-center gap-1 mt-1">
                  <AtSign size={14} className="text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">@{client?.username}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cadastro</label>
              <div className="flex items-center gap-1 mt-1">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(client?.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Key size={18} className="text-primary-600" />
              Senha
            </h3>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button variant="secondary" onClick={() => setShowPasswordForm(true)} className="w-full">
                <Key size={18} />
                Alterar Senha
              </Button>
            ) : (
              <form onSubmit={changePassword} className="space-y-3">
                <div className="relative">
                  <Input
                    label="Senha Atual"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Sua senha atual"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-[34px] text-gray-400"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Nova Senha"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-[34px] text-gray-400"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" loading={passwordLoading}>
                    <Check size={18} />
                    Salvar
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => {
                    setShowPasswordForm(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600 dark:text-red-400">
          <LogOut size={18} />
          Sair da Conta
        </Button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          Salão Reflexus © {new Date().getFullYear()}
        </p>
      </div>
    </ClientPortalLayout>
  )
}
