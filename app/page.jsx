'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { FeedbackWidget } from '@/components/feedback-widget'
import { TrendingUp, TrendingDown, Wallet, Receipt, Building2, Tag } from 'lucide-react'
import { transactionsAPI, accountsAPI, categoriesAPI } from '@/lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoAtual: 0,
    totalTransacoes: 0,
    totalContas: 0,
    totalCategorias: 0
  })
  const [entradasByCategory, setEntradasByCategory] = useState([])
  const [saidasByCategory, setSaidasByCategory] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [dateFilter, setDateFilter] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [transactions, accountsData, categories] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
        categoriesAPI.getAll()
      ])

      setAllTransactions(transactions)
      setAccounts(accountsData)
      calculateStats(transactions, accountsData, categories)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (dateFilter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000) }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return { start: weekStart, end: new Date(now.getTime() + 86400000) }
      case 'month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59) }
      default:
        return { start: new Date(0), end: new Date() }
    }
  }

  const calculateStats = (transactions, accountsData, categoriesData) => {
    const { start, end } = getDateRange()
    
    let filtered = transactions.filter(t => {
      const transDate = new Date(t.data_transacao)
      return transDate >= start && transDate <= end
    })
    
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.conta === accountsData.find(a => a.id.toString() === selectedAccount)?.nome)
    }

    const totalEntradas = filtered
      .filter(t => t.valor > 0)
      .reduce((sum, t) => sum + t.valor, 0)
    
    const totalSaidas = Math.abs(filtered
      .filter(t => t.valor < 0)
      .reduce((sum, t) => sum + t.valor, 0))

    const entradasMap = {}
    const saidasMap = {}

    filtered.forEach(t => {
      const categoria = t.categoria || 'Sem categoria'
      if (t.valor > 0) {
        entradasMap[categoria] = (entradasMap[categoria] || 0) + t.valor
      } else {
        saidasMap[categoria] = (saidasMap[categoria] || 0) + Math.abs(t.valor)
      }
    })

    const entradasData = Object.entries(entradasMap).map(([name, value]) => ({ name, value }))
    const saidasData = Object.entries(saidasMap).map(([name, value]) => ({ name, value }))

    setStats({
      totalEntradas,
      totalSaidas,
      saldoAtual: totalEntradas - totalSaidas,
      totalTransacoes: filtered.length,
      totalContas: accountsData.length,
      totalCategorias: categoriesData.length
    })
    
    setEntradasByCategory(entradasData)
    setSaidasByCategory(saidasData)
  }

  useEffect(() => {
    if (allTransactions.length > 0 && accounts.length > 0) {
      categoriesAPI.getAll().then(categories => {
        calculateStats(allTransactions, accounts, categories)
      })
    }
  }, [selectedAccount, dateFilter, allTransactions, accounts])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="flex items-center justify-center h-64">
            <p>Carregando...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <FeedbackWidget />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">Visão geral das suas finanças</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm w-full sm:w-auto"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
              <option value="all">Tudo</option>
            </select>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm w-full sm:w-auto"
            >
              <option value="all">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id.toString()}>
                  {account.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 lg:mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total de Entradas"
            value={formatCurrency(stats.totalEntradas)}
            icon={TrendingUp}
            description="Receitas do período"
          />
          <StatCard
            title="Total de Saídas"
            value={formatCurrency(stats.totalSaidas)}
            icon={TrendingDown}
            description="Despesas do período"
          />
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(stats.saldoAtual)}
            icon={Wallet}
            description="Diferença entre entradas e saídas"
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total de Transações
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalTransacoes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Contas Cadastradas
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalContas}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Categorias Ativas
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalCategorias}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6 lg:mt-8">
          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-foreground">
              Entradas por Categoria
            </h2>
            {entradasByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={entradasByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {entradasByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma entrada encontrada</p>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-foreground">
              Saídas por Categoria
            </h2>
            {saidasByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={saidasByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {saidasByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 180}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma saída encontrada</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
