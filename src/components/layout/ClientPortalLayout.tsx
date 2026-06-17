'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Scissors, Store } from 'lucide-react'

interface ClientPortalLayoutProps {
  children: React.ReactNode
  activeTab: string
}

export default function ClientPortalLayout({ children, activeTab }: ClientPortalLayoutProps) {
  const [client, setClient] = useState<any>(null)
  const [salonInfo, setSalonInfo] = useState<{ name: string; address: string; phone: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const user = localStorage.getItem('client-user')
    if (!token || !user) {
      router.push('/cliente')
      return
    }
    setClient(JSON.parse(user))

    fetch('/api/config/salon')
      .then(r => r.json())
      .then(data => setSalonInfo(data))
      .catch(() => {})
  }, [])

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'agendar', label: 'Agendar', icon: Calendar, href: '/cliente/agendar' },
    { id: 'agendamentos', label: 'Meus', icon: Clock, href: '/cliente/meus-agendamentos' },
    { id: 'perfil', label: 'Perfil', icon: User, href: '/cliente/perfil' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {client?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white/70 text-sm">Olá,</p>
            <h1 className="text-white text-xl font-bold">{client?.name}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Scissors size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{salonInfo?.name || 'Salão Reflexus'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Seg-Sáb · 8h às 20h</p>
            </div>
          </div>
        </div>

        {children}

        <div className="mt-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Store size={16} className="text-primary-600" />
              Sobre o Salão
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-start gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100 min-w-16">Nome:</span>
                <span>{salonInfo?.name || 'Salão Reflexus'}</span>
              </p>
              {salonInfo?.address && (
                <p className="flex items-start gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 min-w-16">Endereço:</span>
                  <span>{salonInfo.address}</span>
                </p>
              )}
              {salonInfo?.phone && (
                <p className="flex items-start gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 min-w-16">Telefone:</span>
                  <span>{salonInfo.phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-16 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                }`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
