'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { AccountDialog } from '@/components/account-dialog'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { accountsAPI, getUserIdFromToken } from '@/lib/api'

interface BankAccount {
  id: number
  name: string
  currency: string
  color: string
  active: boolean
  share: boolean
  sharewith?: number
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const data = await accountsAPI.getAll()
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.nome,
        currency: item.moeda,
        color: item.cor,
        active: item.ativa,
        share: item.share || false,
        sharewith: item.sharewith || null,
      }))
      setAccounts(mapped)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>()

  const handleSave = async (accountData: any) => {
    try {
      const userId = getUserIdFromToken()

      const payload: any = {
        user: userId,
        nome: accountData.name,
        moeda: accountData.currency,
        cor: accountData.color,
        ativa: accountData.active,
        share: accountData.share,
      }

      if (accountData.share && accountData.shareCode) {
        payload.shareCode = accountData.shareCode
      }

      if ('id' in accountData) {
        const { user, ...updatePayload } = payload
        await accountsAPI.update(accountData.id, updatePayload)
      } else {
        if (!userId) {
          throw new Error('User ID not found in token. Please login again.')
        }

        await accountsAPI.create(payload)
      }
      await loadAccounts()
      setEditingAccount(undefined)
      setDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar conta:', error)
      alert(`Erro ao salvar conta: ${error.message}`)
    }
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleDelete = async (account: BankAccount) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await accountsAPI.delete(account.id)
        await loadAccounts()
      } catch (error) {
        console.error('Erro ao excluir conta:', error)
      }
    }
  }

  const handleAdd = () => {
    setEditingAccount(undefined)
    setDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const columns = [
    { header: 'Nome da Conta', accessor: 'name' as const, className: 'text-sm sm:text-base' },
    { header: 'Moeda', accessor: 'currency' as const, className: 'text-sm hidden sm:table-cell' },
    {
      header: 'Cor',
      accessor: (row: BankAccount) => (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex-shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <span className="text-xs sm:text-sm hidden md:inline">{row.color}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: BankAccount) => (
        <span className={`text-xs sm:text-sm ${row.active ? 'text-green-600' : 'text-red-600'
          }`}>
          {row.active ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
    {
      header: 'Compartilhamento',
      accessor: (row: BankAccount) => (
        <span className={`text-xs sm:text-sm font-medium ${row.share ? 'text-green-600' : 'text-muted-foreground'
          }`}>
          {row.share ? 'Ativado' : 'Desativado'}
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
          title="Contas Bancárias"
          description="Gerencie suas contas bancárias"
          action={
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Conta
            </Button>
          }
        />

        <DataTable
          data={accounts}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <AccountDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          account={editingAccount}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}
