"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { TransactionDialog } from "@/components/transaction-dialog"
import { FeedbackWidget } from "@/components/feedback-widget"
import { MobileFilters } from "@/components/mobile-filters"
import { Button } from "@/components/ui/button"
import { TransactionViewModal } from "@/components/transaction-view-modal"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"
import { transactionsAPI, getUserIdFromToken, categoriesAPI, accountsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: number
  name: string
  type: "entrada" | "saida"
  category: string
  categoryId: number
  account: string
  accountId: number
  amount: number
  date: string
}

export default function TransactionsPage() {
  const [viewOpen, setViewOpen] = useState(false)
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null)
  const [csvDrafts, setCsvDrafts] = useState<any[]>([])
  const [editingCsvIndex, setEditingCsvIndex] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const [filters, setFilters] = useState({
    account: '',
    category: '',
    user: '',
    name: '',
    type: 'all',
    date_transaction_low: '',
    date_transaction_high: new Date().toISOString().split('T')[0],
  })
  const { toast } = useToast()

  useEffect(() => {
    const savedFilters = localStorage.getItem('transactionFilters')
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters))
    } else {
      const defaultFilters = {
        account: '',
        category: '',
        user: '',
        name: '',
        type: 'all',
        date_transaction_low: '',
        date_transaction_high: new Date().toISOString().split('T')[0],
      }
      setFilters(defaultFilters)
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    if (accounts.length > 0 && categories.length > 0) {
      loadTransactions()
      localStorage.setItem('transactionFilters', JSON.stringify(filters))
    }
  }, [filters, accounts, categories])

  const loadInitialData = async () => {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        accountsAPI.getAll(),
        categoriesAPI.getAll(),
      ])
      setAccounts(accountsData)
      setCategories(categoriesData)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      setLoading(false)
    }
  }

  const handleCsvUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    const API_BASE_URL = process.env.IMPORT_CSV || 'https://api-gerenciadorfinanceiro.onrender.com/api/v1/transactions/import/csv'

    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    setCsvDrafts(data)
  }

  const openCsvDraft = (draft: any, index: number) => {
    const valor = Number(draft.amount)
    setEditingCsvIndex(index)

    setEditingTransaction({
      name: draft.title || "Sem descrição",
      type: valor < 0 ? "entrada" : "saida",
      category: "",
      account: "",
      amount: Math.abs(valor),
      date: draft.date.split("T")[0],
    } as any)

    setDialogOpen(true)
  }

  const handleView = async (id: number) => {
    try {
      const data = await transactionsAPI.getById(id)

      setViewTransaction({
        id: data.id,
        name: data.name || "Sem descrição",
        type: data.value > 0 ? "entrada" : "saida",
        category: data.category,
        categoryId: data.category_id,
        account: data.account,
        accountId: data.account_id,
        amount: Math.abs(data.value),
        date: data.date_transaction.split("T")[0],
      })

      setViewOpen(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a transação.",
        variant: "destructive",
      })
    }
  }

  const loadTransactions = async () => {
    try {
      const params: any = {}
      if (filters.account) params.account = filters.account
      if (filters.category) params.category = filters.category
      if (filters.user) params.user = filters.user
      if (filters.user) params.user = filters.user
      if (filters.date_transaction_low) params.date_transaction_low = filters.date_transaction_low
      if (filters.date_transaction_high) params.date_transaction_high = filters.date_transaction_high

      const data = await transactionsAPI.getAll(Object.keys(params).length > 0 ? params : undefined)

      let transactionsList = Array.isArray(data) ? data : (data.result || [])

      const mapped = transactionsList.map((item: any) => {
        const category = categories.find((c: any) => c.nome === item.category)
        const account = accounts.find((a: any) => a.nome === item.account)

        return {
          id: item.id,
          name: item.name || "Sem descrição",
          type: item.value > 0 ? "entrada" : "saida",
          category: item.category || "Sem categoria",
          categoryId: category?.id || 0,
          account: item.account || "Sem conta",
          accountId: account?.id || 0,
          amount: Math.abs(item.value),
          date: item.date_transaction
            ? item.date_transaction.split("T")[0]
            : "",
        }
      })

      const filtered = filters.type === 'all'
        ? mapped
        : mapped.filter((t: Transaction) => t.type === filters.type)

      setTransactions(filtered)
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar as transações. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (transactionData: any) => {
    try {
      const userId = getUserIdFromToken()

      if (!userId && !("id" in transactionData)) {
        throw new Error("User ID not found in token. Please login again.")
      }
      console.log(transactionData)

      if (transactionData.id) {
        const updatePayload = {
          account: Number.parseInt(transactionData.account),
          category: Number.parseInt(transactionData.category),
          value: transactionData.type === "entrada" ? transactionData.amount : -transactionData.amount,
          name: transactionData.name,
          date_transaction: transactionData.date,
        }
        await transactionsAPI.update(transactionData.id, updatePayload)
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        })
      } else {
        const createPayload = {
          user: userId,
          account: Number.parseInt(transactionData.account),
          category: Number.parseInt(transactionData.category),
          value: transactionData.type === "entrada" ? transactionData.amount : -transactionData.amount,
          name: transactionData.name,
          date_transaction: transactionData.date,
        }
        await transactionsAPI.create(createPayload)

        if (editingCsvIndex !== null) {
          setCsvDrafts(prev =>
            prev.filter((_, index) => index !== editingCsvIndex)
          )
          setEditingCsvIndex(null)
        }

        toast({
          title: "Transação criada",
          description: "A transação foi criada com sucesso.",
        })
      }
      setDialogOpen(false)
      setEditingTransaction(undefined)
      await loadTransactions()
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a transação. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({
      ...transaction,
      category: transaction.categoryId.toString(),
      account: transaction.accountId.toString(),
    } as any)
    setDialogOpen(true)
  }

  const handleDelete = async (transaction: Transaction) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await transactionsAPI.delete(transaction.id)
        toast({
          title: "Transação excluída",
          description: "A transação foi excluída com sucesso.",
        })
        await loadTransactions()
      } catch (error) {
        console.error("Erro ao excluir transação:", error)
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a transação. Tente novamente.",
          variant: "destructive",
        })
      }
    }
  }

  const handleAdd = () => {
    setEditingTransaction(undefined)
    setDialogOpen(true)
  }

  const clearFilters = () => {
    setFilters({
      account: '',
      category: '',
      user: '',
      name: '',
      type: 'all',
      date_transaction_low: '',
      date_transaction_high: new Date().toISOString().split('T')[0],
    })
  }

  const hasActiveFilters = filters.account || filters.category || filters.user || filters.name || filters.type !== 'all'

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR")
  }

  const columns = [
    {
      header: "Descrição",
      accessor: (row: Transaction) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground text-xs sm:text-sm truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground truncate">{row.category}</p>
        </div>
      ),
    },
    {
      header: "Conta",
      accessor: "account" as const,
      className: "text-muted-foreground text-xs sm:text-sm hidden sm:table-cell",
    },
    {
      header: "Data",
      accessor: (row: Transaction) => formatDate(row.date),
      className: "text-muted-foreground text-xs whitespace-nowrap",
    },
    {
      header: "Valor",
      accessor: (row: Transaction) => (
        <div className="flex items-center gap-1">
          {row.type === "entrada" ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span
            className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${row.type === "entrada" ? "text-green-600" : "text-red-600"
              }`}
          >
            {row.type === "entrada" ? "+" : "-"}
            {formatCurrency(row.amount)}
          </span>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="h-10 bg-muted animate-pulse rounded w-48" />
              <div className="h-10 bg-muted animate-pulse rounded w-64" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
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
        <PageHeader
          title="Transações"
          description="Gerencie todas as suas transações financeiras"
        />

        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('csvInput')?.click()}
          >
            Importar CSV Nubank
          </Button>
        </div>

        <MobileFilters hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
            <div className="inline-flex rounded-lg border border-border bg-card p-1 flex-1">
              <button
                onClick={() => setFilters({ ...filters, type: 'all' })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${filters.type === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: 'saida' })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${filters.type === 'saida'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Despesas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: 'entrada' })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${filters.type === 'entrada'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Receitas
              </button>
            </div>
          </div>

          <input
            type="date"
            value={filters.date_transaction_low}
            onChange={(e) => setFilters({ ...filters, date_transaction_low: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Data inicial"
          />

          <input
            type="date"
            value={filters.date_transaction_high}
            onChange={(e) => setFilters({ ...filters, date_transaction_high: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Data final"
          />

          <select
            value={filters.account}
            onChange={(e) => setFilters({ ...filters, account: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as contas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.name}>
                {account.name}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filtrar por usuário..."
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <input
            type="text"
            placeholder="Filtrar por descrição..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </MobileFilters>

        <div className="hidden lg:block mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              <button
                onClick={() => setFilters({ ...filters, type: 'all' })}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.type === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: 'saida' })}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.type === 'saida'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Despesas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: 'entrada' })}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.type === 'entrada'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Receitas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="date"
              value={filters.date_transaction_low}
              onChange={(e) => setFilters({ ...filters, date_transaction_low: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Data inicial"
            />

            <input
              type="date"
              value={filters.date_transaction_high}
              onChange={(e) => setFilters({ ...filters, date_transaction_high: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Data final"
            />

            <select
              value={filters.account}
              onChange={(e) => setFilters({ ...filters, account: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.name}>
                  {account.name}
                </option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filtrar por usuário..."
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              type="text"
              placeholder="Filtrar por descrição..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" onClick={() => document.getElementById('csvInput')?.click()}>
            Importar CSV Nubank
          </Button>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filtros ativos:</span>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>

        <input
          id="csvInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCsvUpload}
        />

        {csvDrafts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Transações importadas (não salvas)
            </h3>

            {csvDrafts.map((item, index) => (

              <div
                key={index}
                className="flex items-center justify-between border rounded p-2"
              >
                <span className="text-sm">
                  {item.title || "Sem descrição"} – R$ {Number(item.amount).toFixed(2)}
                </span>

                <Button size="sm" onClick={() => openCsvDraft(item, index)}>
                  Completar
                </Button>
              </div>
            ))}
          </div>
        )}

        <DataTable
          data={transactions}
          columns={columns}
          onRowClick={(row) => handleView(row.id)}
          // onEdit={handleEdit}
          // onDelete={handleDelete}
          onAdd={handleAdd}
          addButtonText="Nova Transação"
        />

        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transaction={editingTransaction}
          onSave={handleSave}
        />

        <TransactionViewModal
          open={viewOpen}
          onOpenChange={setViewOpen}
          transaction={viewTransaction}
          onEdit={() => {
            setViewOpen(false)

            setTimeout(() => {
              handleEdit(viewTransaction!)
            }, 0)
          }}
          onDelete={() => {
            setViewOpen(false)
            handleDelete(viewTransaction!)
          }}
        />

      </main>
    </div>
  )
}
