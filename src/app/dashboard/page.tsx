'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Scissors,
  UserCheck,
  ChevronRight,
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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: data?.todayAppointments || 0,
      icon: CalendarDays,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'Faturamento Hoje',
      value: formatCurrency(data?.todayRevenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Clientes Novos (Mês)',
      value: data?.newClientsThisMonth || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Faturamento Mês',
      value: formatCurrency(data?.monthRevenue || 0),
      icon: TrendingUp,
      color: 'text-gold-600',
      bgColor: 'bg-gold-50 dark:bg-gold-900/20',
    },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Faturamento Semanal</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.dailyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" className="text-gray-500" tick={{ fontSize: 12 }} />
                    <YAxis className="text-gray-500" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="revenue" fill="#c026d3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Serviços Mais Realizados</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.topServices.map(s => ({
                        name: s.service?.name || 'N/A',
                        value: s.count,
                      })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(data?.topServices || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Profissionais</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.topProfessionals.map((item, index) => (
                  <div key={item.professional?.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.professional?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.professional?.specialty || 'Geral'}</p>
                      </div>
                    </div>
                    <Badge variant="info">{item.count} atendimentos</Badge>
                  </div>
                ))}
                {(!data?.topProfessionals || data.topProfessionals.length === 0) && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Atalhos Rápidos</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/agendamento" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                  <CalendarDays size={24} className="text-primary-600" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-400">Novo Agendamento</span>
                </Link>
                <Link href="/clientes/novo" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Users size={24} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Novo Cliente</span>
                </Link>
                <Link href="/servicos/novo" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <Scissors size={24} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Novo Serviço</span>
                </Link>
                <Link href="/financeiro" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gold-50 dark:bg-gold-900/20 hover:bg-gold-100 dark:hover:bg-gold-900/30 transition-colors">
                  <DollarSign size={24} className="text-gold-600" />
                  <span className="text-sm font-medium text-gold-700 dark:text-gold-400">Financeiro</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
