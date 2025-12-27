'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { TransactionDialog } from '@/components/transaction-dialog'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionsAPI, getUserIdFromToken, categoriesAPI, accountsAPI } from '@/lib/api'

interface Transaction {
  id: number
  name: string
  type: 'entrada' | 'saida'
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
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const [data, categories, accounts] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll(),
        accountsAPI.getAll()
      ])

      const mapped = data.resultado.map((item: any) => {
        const category = categories.find((c: any) => c.nome === item.categoria)
        const account = accounts.find((a: any) => a.nome === item.conta)

        return {
          id: item.id,
          name: item.obs || 'Sem descrição',
          type: item.valor > 0 ? 'entrada' : 'saida',
          category: item.categoria || 'Sem categoria',
          categoryId: category?.id || 0,
          account: item.conta || 'Sem conta',
          accountId: account?.id || 0,
          amount: Math.abs(item.valor),
          date: item.data_transacao.split('T')[0],
        }
      })
      setTransactions(mapped)
      setFilteredTransactions(mapped)
      setAccounts(accounts)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedAccount === 'all') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter(t => t.accountId.toString() === selectedAccount))
    }
  }, [selectedAccount, transactions])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()

  const handleSave = async (
    transactionData: any
  ) => {
    try {
      const userId = getUserIdFromToken()

      if (!userId && !('id' in transactionData)) {
        throw new Error('User ID not found in token. Please login again.')
      }

      if ('id' in transactionData) {
        const updatePayload = {
          conta: parseInt(transactionData.account),
          categoria: parseInt(transactionData.category),
          valor: transactionData.type === 'entrada' ? transactionData.amount : -transactionData.amount,
          obs: transactionData.name,
          data_transacao: transactionData.date,
        }
        await transactionsAPI.update(transactionData.id, updatePayload)
      } else {
        const createPayload = {
          user: userId,
          conta: parseInt(transactionData.account),
          categoria: parseInt(transactionData.category),
          valor: transactionData.type === 'entrada' ? transactionData.amount : -transactionData.amount,
          obs: transactionData.name,
          data_transacao: transactionData.date,
        }
        await transactionsAPI.create(createPayload)
      }
      setDialogOpen(false)
      setEditingTransaction(undefined)
      await loadTransactions()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      alert(`Erro ao salvar transação: ${error.message}`)
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
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transactionsAPI.delete(transaction.id)
        await loadTransactions()
      } catch (error) {
        console.error('Erro ao excluir transação:', error)
      }
    }
  }

  const handleAdd = () => {
    setEditingTransaction(undefined)
    setDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const columns = [
    {
      header: 'Nome',
      accessor: (row: Transaction) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground text-xs sm:text-sm truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground truncate">{row.category}</p>
        </div>
      ),
    },
    {
      header: 'Conta',
      accessor: 'account' as const,
      className: 'text-muted-foreground text-xs sm:text-sm hidden sm:table-cell',
    },
    {
      header: 'Data',
      accessor: (row: Transaction) => formatDate(row.date),
      className: 'text-muted-foreground text-xs',
    },
    {
      header: 'Valor',
      accessor: (row: Transaction) => (
        <span
          className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${row.type === 'entrada' ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {row.type === 'entrada' ? '+' : '-'}
          {formatCurrency(row.amount)}
        </span>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <FeedbackWidget />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Transações"
          description="Gerencie todas as suas transações financeiras"
          action={
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          }
        />

        <div className="mb-4">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
          >
            <option value="all">Todas as contas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id.toString()}>
                {account.nome}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          data={filteredTransactions}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
