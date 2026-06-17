'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Scissors,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format, isToday, isThisMonth } from 'date-fns'

const COLORS = ['#c026d3', '#d946ef', '#e879f9', '#f0abfc', '#f5d0fe']

interface DashboardData {
  todayAppointments: number
  monthAppointments: number
  todayRevenue: number
  monthRevenue: number
  newClientsThisMonth: number
  topServices: any[]
  topProfessionals: any[]
  recentTransactions: any[]
  dailyRevenue: any[]
  todayList: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json() })
      .then(data => { setData(data); setLoading(false) })
      .catch(() => {
        setData({ todayAppointments: 0, monthAppointments: 0, todayRevenue: 0, monthRevenue: 0, newClientsThisMonth: 0, topServices: [], topProfessionals: [], recentTransactions: [], dailyRevenue: [] })
        setLoading(false)
      })

    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAppointments(data)
      })
      .catch(() => setAppointments([]))
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const safeDailyRevenue = data?.dailyRevenue || []
  const safeTopServices = data?.topServices || []
  const safeTopProfessionals = data?.topProfessionals || []

  const todayAppts = appointments.filter(a => {
    const apptDate = new Date(a.date)
    return isToday(apptDate) && a.status !== 'CANCELLED'
  }).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const upcomingAppts = appointments.filter(a => {
    const apptDate = new Date(a.date + 'T' + a.startTime)
    const now = new Date()
    return apptDate > now && a.status !== 'CANCELLED'
  }).slice(0, 5)

  const stats = [
    { label: 'Agendamentos Hoje', value: data?.todayAppointments || 0, icon: CalendarDays, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20', change: '+12%' },
    { label: 'Faturamento Hoje', value: formatCurrency(data?.todayRevenue || 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', change: '+8%' },
    { label: 'Clientes (Mês)', value: data?.newClientsThisMonth || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', change: '+3' },
    { label: 'Faturamento Mês', value: formatCurrency(data?.monthRevenue || 0), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', change: '+15%' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Visão geral do salão</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-0.5">
                    <ArrowUpRight size={12} />
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Faturamento Semanal</h3>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeDailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="date" className="text-gray-500" tick={{ fontSize: 12 }} />
                      <YAxis className="text-gray-500" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R$${v}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="revenue" fill="#c026d3" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Serviços Top</h3>
            </CardHeader>
            <CardContent>
              {safeTopServices.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={safeTopServices.map(s => ({ name: s.service?.name || 'N/A', value: s.count }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {safeTopServices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-72 text-gray-400">
                  <Scissors size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">Sem dados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  Hoje
                </h3>
                <Link href="/agenda">
                  <Button variant="ghost" size="sm">
                    Ver Agenda
                    <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <CalendarDays size={36} className="mb-2 opacity-50" />
                  <p className="text-sm">Nenhum agendamento hoje</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayAppts.map((appt: any) => (
                    <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-14">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{appt.startTime}</p>
                          <p className="text-xs text-gray-500">{appt.endTime}</p>
                        </div>
                        <div className={`w-1 h-10 rounded-full ${
                          appt.status === 'COMPLETED' ? 'bg-green-500' :
                          appt.status === 'CANCELLED' ? 'bg-red-500' :
                          appt.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-primary-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{appt.client?.name || 'Cliente'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{appt.professional?.name || 'Profissional'}</p>
                        </div>
                      </div>
                      <Badge variant={
                        appt.status === 'COMPLETED' ? 'success' :
                        appt.status === 'CANCELLED' ? 'danger' :
                        appt.status === 'CONFIRMED' ? 'info' : 'warning'
                      }>
                        {appt.status === 'COMPLETED' ? 'Concluído' :
                         appt.status === 'CANCELLED' ? 'Cancelado' :
                         appt.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                Próximos Agendamentos
              </h3>
            </CardHeader>
            <CardContent>
              {upcomingAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Clock size={36} className="mb-2 opacity-50" />
                  <p className="text-sm">Nenhum agendamento futuro</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingAppts.map((appt: any) => {
                    const date = new Date(appt.date)
                    return (
                      <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-14">
                            <p className="text-lg font-bold text-primary-600">{format(date, 'dd')}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{format(date, 'MMM', { locale: undefined })}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{appt.client?.name || 'Cliente'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{appt.startTime} · {appt.professional?.name || ''}</p>
                          </div>
                        </div>
                        <Badge variant="info">{appt.status}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Atalhos Rápidos</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/agendamento" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group">
                <CalendarDays size={24} className="text-primary-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-400">Novo Agendamento</span>
              </Link>
              <Link href="/clientes" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                <Users size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Clientes</span>
              </Link>
              <Link href="/servicos" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
                <Scissors size={24} className="text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Serviços</span>
              </Link>
              <Link href="/financeiro" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
                <DollarSign size={24} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Financeiro</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
