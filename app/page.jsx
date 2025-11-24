'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { FeedbackWidget } from '@/components/feedback-widget'
import { TrendingUp, TrendingDown, Wallet, Receipt, Building2, Tag } from 'lucide-react'
import { transactionsAPI, accountsAPI, categoriesAPI } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoAtual: 0,
    totalTransacoes: 0,
    totalContas: 0,
    totalCategorias: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState('all')
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

  const calculateStats = (transactions, accountsData, categoriesData) => {
    const filtered = selectedAccount === 'all' 
      ? transactions 
      : transactions.filter(t => t.conta === accountsData.find(a => a.id.toString() === selectedAccount)?.nome)

    const totalEntradas = filtered
      .filter(t => t.valor > 0)
      .reduce((sum, t) => sum + t.valor, 0)
    
    const totalSaidas = Math.abs(filtered
      .filter(t => t.valor < 0)
      .reduce((sum, t) => sum + t.valor, 0))

    const recent = filtered
      .sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao))
      .slice(0, 4)
      .map(t => ({
        name: t.obs || 'Sem descrição',
        category: t.categoria || 'Sem categoria',
        date: new Date(t.data_transacao).toLocaleDateString('pt-BR'),
        amount: Math.abs(t.valor),
        type: t.valor > 0 ? 'entrada' : 'saida'
      }))

    setStats({
      totalEntradas,
      totalSaidas,
      saldoAtual: totalEntradas - totalSaidas,
      totalTransacoes: filtered.length,
      totalContas: accountsData.length,
      totalCategorias: categoriesData.length
    })
    
    setRecentTransactions(recent)
  }

  useEffect(() => {
    if (allTransactions.length > 0 && accounts.length > 0) {
      categoriesAPI.getAll().then(categories => {
        calculateStats(allTransactions, accounts, categories)
      })
    }
  }, [selectedAccount, allTransactions, accounts])

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">Visão geral das suas finanças</p>
          </div>
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

        {/* Recent Transactions */}
        <Card className="mt-6 lg:mt-8 p-4 sm:p-6">
          <h2 className="mb-4 text-lg sm:text-xl font-semibold text-foreground">
            Transações Recentes
          </h2>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">{transaction.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {transaction.category} • {transaction.date}
                    </p>
                  </div>
                  <p
                    className={`text-base sm:text-lg font-semibold whitespace-nowrap ${
                      transaction.type === 'entrada'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'entrada' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
