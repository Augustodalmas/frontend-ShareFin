'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { TransactionDialog } from '@/components/transaction-dialog'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionsAPI, getUserIdFromToken } from '@/lib/api'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await transactionsAPI.getAll()
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.obs || 'Sem descrição',
        type: item.valor > 0 ? 'entrada' : 'saida',
        category: item.categoria_nome || 'Sem categoria',
        categoryId: item.categoria_id,
        account: item.conta_nome || 'Sem conta',
        accountId: item.conta_id,
        amount: Math.abs(item.valor),
        date: item.data_transacao.split('T')[0],
      }))
      setTransactions(mapped)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()

  const handleSave = async (
    transactionData: Omit<Transaction, 'id'> | Transaction
  ) => {
    try {
      const userId = getUserIdFromToken()
      const payload = {
        user: userId,
        conta: parseInt(transactionData.account),
        categoria: parseInt(transactionData.category),
        valor: transactionData.type === 'entrada' ? transactionData.amount : -transactionData.amount,
        obs: transactionData.name,
      }
      
      if (!userId) {
        throw new Error('User ID not found in token. Please login again.')
      }
      
      if ('id' in transactionData) {
        const { user, ...updatePayload } = payload
        await transactionsAPI.update(transactionData.id, updatePayload)
      } else {
        await transactionsAPI.create(payload)
      }
      await loadTransactions()
      setEditingTransaction(undefined)
      setDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      alert(`Erro ao salvar transação: ${error.message}`)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
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
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full p-2 ${
              row.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {row.type === 'entrada' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-sm text-muted-foreground">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Conta',
      accessor: 'account' as const,
      className: 'text-muted-foreground',
    },
    {
      header: 'Data',
      accessor: (row: Transaction) => formatDate(row.date),
      className: 'text-muted-foreground',
    },
    {
      header: 'Valor',
      accessor: (row: Transaction) => (
        <span
          className={`text-lg font-semibold ${
            row.type === 'entrada' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {row.type === 'entrada' ? '+' : '-'}
          {formatCurrency(row.amount)}
        </span>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
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

        <DataTable
          data={transactions}
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
