'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

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
      <PWAInstallPrompt />
    </div>
  )
}
