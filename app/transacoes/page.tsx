"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { TransactionDialog } from "@/components/transaction-dialog"
import { FeedbackWidget } from "@/components/feedback-widget"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, X } from "lucide-react"
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const [data, categories, accounts] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll(),
        accountsAPI.getAll(),
      ])

      const mapped = data.resultado.map((item: any) => {
        const category = categories.find((c: any) => c.nome === item.categoria)
        const account = accounts.find((a: any) => a.nome === item.conta)

        return {
          id: item.id,
          name: item.obs || "Sem descrição",
          type: item.valor > 0 ? "entrada" : "saida",
          category: item.categoria || "Sem categoria",
          categoryId: category?.id || 0,
          account: item.conta || "Sem conta",
          accountId: account?.id || 0,
          amount: Math.abs(item.valor),
          date: item.data_transacao.split("T")[0],
        }
      })
      setTransactions(mapped)
      setFilteredTransactions(mapped)
      setAccounts(accounts)
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar as transações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedAccount === "all") {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter((t) => t.accountId.toString() === selectedAccount))
    }
  }, [selectedAccount, transactions])

  const handleSave = async (transactionData: any) => {
    try {
      const userId = getUserIdFromToken()

      if (!userId && !("id" in transactionData)) {
        throw new Error("User ID not found in token. Please login again.")
      }

      if ("id" in transactionData) {
        const updatePayload = {
          conta: Number.parseInt(transactionData.account),
          categoria: Number.parseInt(transactionData.category),
          valor: transactionData.type === "entrada" ? transactionData.amount : -transactionData.amount,
          obs: transactionData.name,
          data_transacao: transactionData.date,
        }
        await transactionsAPI.update(transactionData.id, updatePayload)
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        })
      } else {
        const createPayload = {
          user: userId,
          conta: Number.parseInt(transactionData.account),
          categoria: Number.parseInt(transactionData.category),
          valor: transactionData.type === "entrada" ? transactionData.amount : -transactionData.amount,
          obs: transactionData.name,
          data_transacao: transactionData.date,
        }
        await transactionsAPI.create(createPayload)
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
    setSelectedAccount("all")
  }

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
            className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
              row.type === "entrada" ? "text-green-600" : "text-red-600"
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
      <Button
        onClick={handleAdd}
        className="fixed bottom-6 right-6 lg:hidden h-14 w-14 rounded-full shadow-lg z-30"
        size="icon"
        aria-label="Adicionar transação"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Transações"
          description="Gerencie todas as suas transações financeiras"
          action={
            <Button onClick={handleAdd} className="hidden lg:flex" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nova Transação
            </Button>
          }
        />

        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 sm:max-w-xs">
              <label htmlFor="account-filter" className="sr-only">
                Filtrar por conta
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

          {selectedAccount !== "all" && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">Filtros ativos:</span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <span>{accounts.find((a) => a.id.toString() === selectedAccount)?.nome}</span>
                <X className="h-3 w-3" />
              </button>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        <DataTable data={filteredTransactions} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />

        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transaction={editingTransaction}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}
