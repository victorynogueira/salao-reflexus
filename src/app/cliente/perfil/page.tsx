'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientLayout from '@/components/layout/ClientLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { User, Phone, AtSign, Key, Eye, EyeOff, LogOut, Check, Save } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
    const userStr = localStorage.getItem('client-user')
    if (!userStr) return
    const u = JSON.parse(userStr)
    setClient(u)
    setNameValue(u.name)
    setPhoneValue(u.phone)
    setLoading(false)
    
    // Auto-open password form if required
    if (u.mustChangePassword) {
      setShowPasswordForm(true)
    }
  }, [])

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccess(msg); setError('') }
    else { setError(msg); setSuccess('') }
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
        showMsg('Nome atualizado!')
        setEditingName(false)
      } else {
        showMsg('Erro ao atualizar', 'error')
      }
    } catch {
      showMsg('Erro ao conectar', 'error')
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
        showMsg('Telefone atualizado!')
        setEditingPhone(false)
      } else {
        showMsg('Erro ao atualizar', 'error')
      }
    } catch {
      showMsg('Erro ao conectar', 'error')
    } finally {
      setPhoneLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 4) { showMsg('Mínimo 4 caracteres', 'error'); return }
    if (newPassword !== confirmPassword) { showMsg('Senhas não coincidem', 'error'); return }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/client/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { showMsg(data.error || 'Erro ao alterar', 'error') }
      else {
        const u = { ...client, mustChangePassword: false }
        setClient(u)
        localStorage.setItem('client-user', JSON.stringify(u))
        showMsg('Senha alterada!')
        setShowPasswordForm(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // Refresh to trigger layout guard removal
        window.location.reload()
      }
    } catch { showMsg('Erro ao conectar', 'error') }
    finally { setPasswordLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('client-token')
    localStorage.removeItem('client-user')
    router.push('/cliente')
  }

  if (loading) return (
    <ClientLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    </ClientLayout>
  )

  const createdDate = client?.createdAt ? format(new Date(client.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '-'

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie seus dados e configurações</p>
        </div>

        {(success || error) && (
          <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200'
          }`}>
            <Check size={16} />
            {success || error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {client?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{client?.name}</h2>
                {client?.mustChangePassword && <Badge variant="warning">Trocar Senha</Badge>}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{client?.username}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          <div className="p-4">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nome</label>
            {editingName ? (
              <div className="flex gap-2 mt-2">
                <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={updateName} loading={nameLoading}><Save size={16} /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameValue(client.name) }}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{client?.name}</p>
                <button onClick={() => setEditingName(true)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Editar</button>
              </div>
            )}
          </div>

          <div className="p-4">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Telefone</label>
            {editingPhone ? (
              <div className="flex gap-2 mt-2">
                <Input value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={updatePhone} loading={phoneLoading}><Save size={16} /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingPhone(false); setPhoneValue(client.phone) }}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{client?.phone}</p>
                <button onClick={() => setEditingPhone(true)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Editar</button>
              </div>
            )}
          </div>

          <div className="p-4">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Usuário</label>
            <div className="flex items-center gap-1 mt-1">
              <AtSign size={14} className="text-gray-400" />
              <p className="font-medium text-gray-900 dark:text-gray-100">@{client?.username}</p>
            </div>
          </div>

          <div className="p-4">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cadastro</label>
            <div className="flex items-center gap-1 mt-1">
              <User size={14} className="text-gray-400" />
              <p className="text-sm text-gray-900 dark:text-gray-100">{createdDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          {!showPasswordForm ? (
            <Button variant="secondary" onClick={() => setShowPasswordForm(true)} className="w-full">
              <Key size={18} />
              Alterar Senha
            </Button>
          ) : (
            <form onSubmit={changePassword} className="space-y-3">
              {client?.mustChangePassword && (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-sm">
                  <p className="font-medium">Primeiro Acesso</p>
                  <p className="text-xs mt-1">Por segurança, altere sua senha temporária antes de agendar.</p>
                </div>
              )}
              <div className="relative">
                <Input label="Senha Atual" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-[34px] text-gray-400">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Input label="Nova Senha" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 4 caracteres" required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-[34px] text-gray-400">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input label="Confirmar" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" loading={passwordLoading}><Check size={18} />Salvar</Button>
                {!client?.mustChangePassword && (
                  <Button type="button" variant="ghost" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }}>Cancelar</Button>
                )}
              </div>
            </form>
          )}
        </div>

        <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600 dark:text-red-400">
          <LogOut size={18} />
          Sair da Conta
        </Button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          Salão Reflexus © {new Date().getFullYear()}
        </p>
      </div>
    </ClientLayout>
  )
}
