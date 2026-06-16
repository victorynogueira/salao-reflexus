'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { formatCurrency } from '@/utils/format'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  date: string
  category: string | null
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'INCOME',
    description: '',
    amount: '',
    category: '',
  })

  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('startDate', dateRange.startDate)
      params.set('endDate', dateRange.endDate)
      const res = await fetch(`/api/transactions?${params}`)
      const data = await res.json()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [dateRange])

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const profit = totalIncome - totalExpense

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowNewModal(false)
        setFormData({ type: 'INCOME', description: '', amount: '', category: '' })
        fetchTransactions()
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error)
    }
  }

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 6 + i)
    const dayStr = format(date, 'yyyy-MM-dd')
    const dayTransactions = transactions.filter(t => t.date.startsWith(dayStr))
    return {
      date: format(date, 'dd/MM'),
      income: dayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
    }
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financeiro</h1>
            <p className="text-gray-500 dark:text-gray-400">Controle de entradas e saídas</p>
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus size={18} />
            Nova Transação
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <ArrowUpRight size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Entradas</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <ArrowDownRight size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Saídas</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${profit >= 0 ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <DollarSign size={24} className={profit >= 0 ? 'text-primary-600' : 'text-red-600'} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lucro</p>
                  <p className={`text-xl font-bold ${profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fluxo Semanal</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" className="text-gray-500" tick={{ fontSize: 12 }} />
                    <YAxis className="text-gray-500" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="income" name="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtrar Período</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data Início"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <Input
                  label="Data Fim"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDateRange({
                    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                  })}
                >
                  Este Mês
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    setDateRange({
                      startDate: format(today, 'yyyy-MM-dd'),
                      endDate: format(today, 'yyyy-MM-dd'),
                    })
                  }}
                >
                  Hoje
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transações</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{transaction.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(transaction.date), "dd/MM/yyyy")}
                          {transaction.category && ` • ${transaction.category}`}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Nova Transação">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <Select
            label="Tipo"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'INCOME', label: 'Entrada' },
              { value: 'EXPENSE', label: 'Saída' },
            ]}
          />
          <Input
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Input
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Aluguel, Produtos, etc."
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus size={18} />
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
