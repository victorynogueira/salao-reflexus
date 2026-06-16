'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/format'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: CalendarDays },
  { name: 'Agendamento', href: '/agendamento', icon: CalendarDays },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Serviços', href: '/servicos', icon: Scissors },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null
  if (pathname === '/login') return null

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:inset-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className={cn('flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800', collapsed && 'justify-center')}>
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Scissors size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Reflexus
                </span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed && 'justify-center',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button
              onClick={toggleDarkMode}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </button>

            <button
              onClick={() => { logout(); setMobileOpen(false) }}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              <LogOut size={20} />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>

          {!collapsed && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role === 'ADMIN' ? 'Administrador' : 'Recepcionista'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
