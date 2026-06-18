'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt'
import ChatPanel from '@/components/chat/ChatPanel'
import { MessageCircle, X } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showChat, setShowChat] = useState(false)
  const [chatClientId, setChatClientId] = useState<string | undefined>(undefined)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setChatClientId(detail.clientId)
      setShowChat(true)
    }
    window.addEventListener('open-chat', handler as any)
    return () => window.removeEventListener('open-chat', handler as any)
  }, [])

  useEffect(() => {
    if (!user || pathname === '/login') return
    fetch('/api/chat/unread').then(r => r.json()).then(data => {
      setUnreadCount(data.total || 0)
    }).catch(() => {})
  }, [user, pathname])

  useEffect(() => {
    if (!showChat) {
      fetch('/api/chat/unread').then(r => r.json()).then(data => {
        setUnreadCount(data.total || 0)
      }).catch(() => {})
    }
  }, [showChat])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      <button
        onClick={() => { setShowChat(!showChat); setChatClientId(undefined) }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 text-white shadow-xl hover:bg-primary-700 transition-colors flex items-center justify-center"
      >
        {showChat ? <X size={24} /> : <MessageCircle size={24} />}
        {!showChat && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <ChatPanel key={chatClientId || 'default'} initialClientId={chatClientId} />
        </div>
      )}

      <PWAInstallPrompt />
    </div>
  )
}
