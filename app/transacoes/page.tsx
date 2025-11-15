'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { TransactionDialog } from '@/components/transaction-dialog'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

interface Transaction {
  id: number
  name: string
  type: 'entrada' | 'saida'
  category: string
  account: string
  amount: number
  date: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      name: 'Supermercado',
      type: 'saida',
      category: 'Alimentação',
      account: 'Nubank',
      amount: 240.0,
      date: '2025-11-15',
    },
    {
      id: 2,
      name: 'Salário',
      type: 'entrada',
      category: 'Renda',
      account: 'Itaú - Conta Corrente',
      amount: 5000.0,
      date: '2025-11-14',
    },
    {
      id: 3,
      name: 'Conta de Luz',
      type: 'saida',
      category: 'Moradia',
      account: 'Itaú - Conta Corrente',
      amount: 180.0,
      date: '2025-11-13',
    },
    {
      id: 4,
      name: 'Freelance',
      type: 'entrada',
      category: 'Renda Extra',
      account: 'Nubank',
      amount: 800.0,
      date: '2025-11-12',
    },
    {
      id: 5,
      name: 'Uber',
      type: 'saida',
      category: 'Transporte',
      account: 'Nubank',
      amount: 45.5,
      date: '2025-11-11',
    },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >()

  const handleSave = (
    transactionData: Omit<Transaction, 'id'> | Transaction
  ) => {
    if ('id' in transactionData) {
      setTransactions(
        transactions.map((t) =>
          t.id === transactionData.id ? transactionData : t
        )
      )
    } else {
      const newTransaction = { ...transactionData, id: Date.now() }
      setTransactions([newTransaction, ...transactions])
    }
    setEditingTransaction(undefined)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(transactions.filter((t) => t.id !== transaction.id))
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
