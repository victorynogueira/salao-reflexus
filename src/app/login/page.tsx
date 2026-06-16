'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Scissors, Eye, EyeOff, Loader2, Smartphone, User } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initStatus, setInitStatus] = useState<'idle' | 'initing' | 'done'>('idle')
  const [sampleCreds, setSampleCreds] = useState<any>(null)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    let seeded = false
    try {
      seeded = localStorage.getItem('db-seeded') === 'true'
    } catch {}

    if (!seeded) {
      setInitStatus('initing')
      const timeout = setTimeout(() => setInitStatus('done'), 5000)

      fetch('/api/init', { method: 'POST' })
        .then(r => r.json())
        .then((data) => {
          clearTimeout(timeout)
          try { localStorage.setItem('db-seeded', 'true') } catch {}
          setSampleCreds(data)
          setInitStatus('done')
        })
        .catch(() => {
          clearTimeout(timeout)
          setInitStatus('done')
        })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Email ou senha inválidos')
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (initStatus === 'initing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Preparando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg mb-4">
            <Scissors size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Salão Reflexus
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sistema de Gestão e Agendamento</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Entrar na sua conta</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {initStatus === 'done' && (
            <div className="mb-4 space-y-2">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
                Sistema inicializado!
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Admin:</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">
                  admin@reflexus.com / admin123
                </p>
              </div>
              {sampleCreds && sampleCreds.samplePassword && (
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm">
                  <p className="font-medium text-purple-700 dark:text-purple-400 mb-2">Clientes de teste:</p>
                  <p className="text-xs text-purple-600 dark:text-purple-500">
                    Senha: {sampleCreds.samplePassword} (usuário gerado automaticamente)
                  </p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 text-sm">
                <p className="font-medium text-gold-700 dark:text-gold-400 mb-1">Profissional:</p>
                <p className="text-xs text-gold-600 dark:text-gold-500">
                  Rosa cadastrada automaticamente como única profissional.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Salão Reflexus. Todos os direitos reservados.
        </p>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <a href="/cliente" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 justify-center">
              <User size={14} />
              Sou Cliente - Ver Meus Agendamentos
            </a>
          </div>
      </div>

      <PWAInstallPrompt />
    </div>
  )
}
