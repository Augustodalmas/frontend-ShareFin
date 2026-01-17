"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { FeedbackWidget } from "@/components/feedback-widget"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, Receipt, Building2, Tag, Plus } from "lucide-react"
import { transactionsAPI, accountsAPI, categoriesAPI, dashboardAPI } from "@/lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts"
import { TransactionDialog } from "@/components/transaction-dialog"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoAtual: 0,
    totalTransacoes: 0,
    totalContas: 0,
    totalCategorias: 0,
  })

  const [last6Months, setLast6Months] = useState([])
  const [categorias, setCategorias] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const last6MonthsChartData = last6Months.map((item) => ({
    month: item.month,
    expenses: Math.abs(item.expenses || 0),
    revenues: Math.abs(item.revenues || 0),
  }))


  const loadDashboardData = async () => {
    try {
      const { start, end } = getDateRange()
      const data_transacao_low = start.toISOString().split('T')[0]
      const data_transacao_high = end.toISOString().split('T')[0]

      const dashboardParams = {
        data_transacao_low,
        data_transacao_high,
      }

      // 👉 só envia conta se NÃO for "all"
      if (selectedAccount !== "all") {
        dashboardParams.conta = selectedAccount
      }

      const [dashboardStats, accountsData, categories] = await Promise.all([
        dashboardAPI.getStats(dashboardParams),
        accountsAPI.getAll(),
        categoriesAPI.getAll(),
      ])

      setAccounts(accountsData)

      setStats({
        totalEntradas: dashboardStats.revenues || 0,
        totalSaidas: Math.abs(dashboardStats.expenses || 0),
        saldoAtual: dashboardStats.total || 0,
        totalTransacoes: dashboardStats.count || 0,
        totalContas: accountsData.length,
        totalCategorias: categories.length,
      })

      setCategorias(dashboardStats.categories || [])
      setLast6Months(dashboardStats.last6 || [])

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
      case "today":
        return { start: today, end: new Date(today.getTime() + 86400000) }
      case "week":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return { start: weekStart, end: new Date(now.getTime() + 86400000) }
      case "month":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        }
      case "year":
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59) }
      default:
        return { start: new Date(0), end: new Date() }
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [selectedAccount, dateFilter])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleAddTransaction = () => {
    setDialogOpen(true)
  }

  const handleSave = async (transactionData) => {
    try {
      const userId = getUserIdFromToken()
      if (!userId) {
        throw new Error("User ID not found in token. Please login again.")
      }

      const createPayload = {
        user: userId,
        conta: Number.parseInt(transactionData.account),
        categoria: Number.parseInt(transactionData.category),
        valor: transactionData.type === "entrada" ? transactionData.amount : -transactionData.amount,
        obs: transactionData.name,
        data_transacao: transactionData.date,
      }
      await transactionsAPI.create(createPayload)
      setDialogOpen(false)
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
      alert(`Erro ao salvar transação: ${error.message}`)
    }
  }

  const getUserIdFromToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.id
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">Visão geral das suas finanças</p>
          </div>
          <Button onClick={handleAddTransaction} className="hidden lg:flex" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Transação
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor="period-filter" className="sr-only">
              Período
            </label>
            <select
              id="period-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
              <option value="all">Tudo</option>
            </select>
          </div>
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor="account-filter" className="sr-only">
              Conta
            </label>
            <select
              id="account-filter"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.nome}>
                  {account.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Card className="mb-6 lg:mb-8 p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Saldo do Período</p>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <p className="text-4xl sm:text-5xl font-bold text-foreground mb-1">{formatCurrency(stats.saldoAtual)}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </Card>
        <div className="mb-6 lg:mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          <Card className="p-4 sm:p-6 border-l-4 border-l-green-500">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Entradas
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">+{formatCurrency(stats.totalEntradas)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Receitas do período</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 border-l-4 border-l-red-500">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Saídas
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">-{formatCurrency(stats.totalSaidas)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Despesas do período</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 lg:mb-8">
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Transações</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalTransacoes}</p>
                <p className="text-xs text-muted-foreground">neste período</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Contas Ativas</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalContas}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary hover:underline"
                  onClick={() => router.push("/contas")}
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalCategorias}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary hover:underline"
                  onClick={() => router.push("/categorias")}
                >
                  Gerenciar
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Distribuição de Receitas</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Proporção por categoria</p>
            </div>
            {categorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorias.filter(c => c.revenues > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="revenues"
                    nameKey="categorie"
                  >
                    {categorias.map((_, index) => (
                      <Cell key={index} fill={`hsl(${index * 45 + 120}, 65%, 55%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhuma receita encontrada</p>
                <p className="text-xs text-muted-foreground mt-1">Adicione transações de entrada para ver o gráfico</p>
              </div>
            )}
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Distribuição de Despesas</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Proporção por categoria</p>
            </div>
            {categorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorias
                      .filter(c => c.expenses < 0)
                      .map(c => ({
                        ...c,
                        expenses: Math.abs(c.expenses),
                      }))
                    }
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="expenses"
                    nameKey="categorie"
                  >
                    {categorias.map((_, index) => (
                      <Cell key={index} fill={`hsl(${index * 45}, 65%, 55%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingDown className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
                <p className="text-xs text-muted-foreground mt-1">Adicione transações de saída para ver o gráfico</p>
              </div>
            )}
          </Card>
        </div>
        <Card className="mt-6 p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Receitas e Despesas - Últimos 6 Meses
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Comparativo mensal
            </p>
          </div>

          {last6Months.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={last6MonthsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Math.abs(value))}
                  cursor={false}
                />
                <Legend />

                {/* Receitas */}
                <Bar
                  dataKey="revenues"
                  name="Receitas"
                  fill="hsl(142, 65%, 45%)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    position="top"
                    formatter={(value) => {
                      if (!value || value === 0) return null
                      return formatCurrency(value)
                    }}
                    fontSize={12}
                  />
                </Bar>

                {/* Despesas (valor negativo, mas visual positivo) */}
                <Bar
                  dataKey="expenses"
                  name="Despesas"
                  fill="hsl(0, 70%, 55%)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    position="top"
                    formatter={(value) => {
                      if (!value || value === 0) return null
                      return formatCurrency(value)
                    }}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum dado encontrado para os últimos meses
              </p>
            </div>
          )}
        </Card>

      </main>
      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />
    </div>
  )
}
