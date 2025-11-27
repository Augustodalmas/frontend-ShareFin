'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Card } from '@/components/ui/card'
import { transactionsAPI } from '@/lib/api'

interface SharedTransaction {
  id: number
  name: string
  type: 'entrada' | 'saida'
  category: string
  account: string
  usuario: string
  amount: number
  date: string
}

export default function SharedTransactionsPage() {
  const [transactions, setTransactions] = useState<SharedTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSharedTransactions()
  }, [])

  const loadSharedTransactions = async () => {
    try {
      const data = await transactionsAPI.getShared()
      
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.obs || 'Sem descrição',
        type: item.valor > 0 ? 'entrada' : 'saida',
        category: item.categoria || 'Sem categoria',
        account: item.conta || 'Sem conta',
        usuario: item.usuario || 'Sem usuário',
        amount: Math.abs(item.valor),
        date: item.data_transacao.split('T')[0],
      }))
      setTransactions(mapped)
    } catch (error) {
      console.error('Erro ao carregar transações compartilhadas:', error)
    } finally {
      setLoading(false)
    }
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
      accessor: (row: SharedTransaction) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground text-xs sm:text-sm truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground truncate">{row.category}</p>
        </div>
      ),
    },
    {
      header: 'Usuário',
      accessor: 'usuario' as const,
      className: 'text-muted-foreground text-xs sm:text-sm hidden md:table-cell',
    },
    {
      header: 'Conta',
      accessor: 'account' as const,
      className: 'text-muted-foreground text-xs sm:text-sm hidden sm:table-cell',
    },
    {
      header: 'Data',
      accessor: (row: SharedTransaction) => formatDate(row.date),
      className: 'text-muted-foreground text-xs',
    },
    {
      header: 'Valor',
      accessor: (row: SharedTransaction) => (
        <span
          className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
            row.type === 'entrada' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {row.type === 'entrada' ? '+' : '-'}
          {formatCurrency(row.amount)}
        </span>
      ),
    },
  ]

  const totalEntradas = transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSaidas = transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0)

  const saldo = totalEntradas - totalSaidas

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <FeedbackWidget />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Transações Compartilhadas"
          description="Visualize todas as transações de contas compartilhadas"
        />

        <div className="mb-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Entradas</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Saídas</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
          </Card>
          <Card className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo</p>
            <p className={`text-xl sm:text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </Card>
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </Card>
        ) : (
          <DataTable
            data={transactions}
            columns={columns}
          />
        )}
      </main>
    </div>
  )
}
