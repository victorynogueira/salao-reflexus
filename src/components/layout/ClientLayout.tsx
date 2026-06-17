'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Key,
} from 'lucide-react'
import { cn } from '@/utils/format'
import { useTheme } from '@/context/ThemeContext'

interface ClientLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Agendar', href: '/cliente/agendar', icon: Calendar },
  { name: 'Meus Agendamentos', href: '/cliente/meus-agendamentos', icon: Clock },
  { name: 'Meu Perfil', href: '/cliente/perfil', icon: User },
]

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('client-token')
    const userStr = localStorage.getItem('client-user')
    if (!token || !userStr) {
      router.push('/cliente')
      return
    }
    const user = JSON.parse(userStr)
    setClient(user)

    if (user.mustChangePassword && !pathname.includes('perfil')) {
      router.push('/cliente/perfil')
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const isPasswordChangeRequired = client.mustChangePassword

  const handleLogout = () => {
    localStorage.removeItem('client-token')
    localStorage.removeItem('client-user')
    router.push('/cliente')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:inset-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-20' : 'lg:w-72'
        )}
      >
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none">
          {/* Logo */}
          <div className={cn('flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800', collapsed && 'justify-center')}>
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                  <Scissors size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Reflexus
                </span>
              </div>
            )}
            {collapsed && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                <Scissors size={18} className="text-white" />
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const isDisabled = isPasswordChangeRequired && item.href !== '/cliente/perfil'

              if (isDisabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed mb-0.5 opacity-60"
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                    {!collapsed && item.href === '/cliente/agendar' && <Key size={12} className="ml-auto text-yellow-500" />}
                  </div>
                )
              }

              return (
                <button
                  key={item.name}
                  onClick={() => { router.push(item.href); setMobileOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-0.5',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <item.icon size={18} className={cn('flex-shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />}
                </button>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <button
              onClick={toggleDarkMode}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </button>

            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              <LogOut size={18} />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>

          {/* User Profile Card */}
          {!collapsed && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {client.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{client.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{client.username}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {isPasswordChangeRequired && pathname !== '/cliente/perfil' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-6 py-3 flex items-center gap-3">
            <Key size={18} className="text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <span className="font-medium">Atenção:</span> Você precisa alterar sua senha temporária antes de agendar.
              <button onClick={() => router.push('/cliente/perfil')} className="ml-2 underline font-bold hover:text-yellow-800">Ir para Perfil</button>
            </p>
          </div>
        )}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
