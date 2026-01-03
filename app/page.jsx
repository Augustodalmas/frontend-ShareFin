"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { FeedbackWidget } from "@/components/feedback-widget"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, Receipt, Building2, Tag, Plus } from "lucide-react"
import { transactionsAPI, accountsAPI, categoriesAPI } from "@/lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
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
  const [entradasByCategory, setEntradasByCategory] = useState([])
  const [saidasByCategory, setSaidasByCategory] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [transactions, accountsData, categories] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
        categoriesAPI.getAll(),
      ])

      const transactionsList = Array.isArray(transactions) ? transactions : (transactions.result || [])
      setAllTransactions(transactionsList)
      setAccounts(accountsData)
      calculateStats(transactionsList, accountsData, categories)
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
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

  const calculateStats = (transactions, accountsData, categoriesData) => {
    const { start, end } = getDateRange()

    let filtered = transactions.filter((t) => {
      const transDate = new Date(t.data_transacao)
      return transDate >= start && transDate <= end
    })

    if (selectedAccount !== "all") {
      filtered = filtered.filter((t) => t.conta === accountsData.find((a) => a.id.toString() === selectedAccount)?.nome)
    }

    const totalEntradas = filtered.filter((t) => t.valor > 0).reduce((sum, t) => sum + t.valor, 0)

    const totalSaidas = Math.abs(filtered.filter((t) => t.valor < 0).reduce((sum, t) => sum + t.valor, 0))

    const entradasMap = {}
    const saidasMap = {}

    filtered.forEach((t) => {
      const categoria = t.categoria || "Sem categoria"
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
      totalCategorias: categoriesData.length,
    })

    setEntradasByCategory(entradasData)
    setSaidasByCategory(saidasData)
  }

  useEffect(() => {
    if (allTransactions.length > 0 && accounts.length > 0) {
      categoriesAPI.getAll().then((categories) => {
        calculateStats(allTransactions, accounts, categories)
      })
    }
  }, [selectedAccount, dateFilter, allTransactions, accounts])

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
      <Button
        onClick={handleAddTransaction}
        className="fixed bottom-6 right-6 lg:hidden h-14 w-14 rounded-full shadow-lg z-30"
        size="icon"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Adicionar transação</span>
      </Button>
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
                <option key={account.id} value={account.id.toString()}>
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
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 120}, 65%, 55%)`} />
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
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 65%, 55%)`} />
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
      </main>
      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />
    </div>
  )
}
