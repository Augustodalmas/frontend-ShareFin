'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { AccountDialog } from '@/components/account-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BankAccount {
  id: number
  name: string
  bank: string
  accountNumber?: string
  balance: number
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: 1,
      name: 'Conta Corrente Principal',
      bank: 'Itaú',
      accountNumber: '12345-6',
      balance: 5240.5,
    },
    {
      id: 2,
      name: 'Conta Poupança',
      bank: 'Caixa',
      accountNumber: '98765-4',
      balance: 12000,
    },
    {
      id: 3,
      name: 'Nubank',
      bank: 'Nubank',
      balance: 850.75,
    },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>()

  const handleSave = (accountData: Omit<BankAccount, 'id'> | BankAccount) => {
    if ('id' in accountData) {
      setAccounts(accounts.map((a) => (a.id === accountData.id ? accountData : a)))
    } else {
      const newAccount = { ...accountData, id: Date.now() }
      setAccounts([...accounts, newAccount])
    }
    setEditingAccount(undefined)
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleDelete = (account: BankAccount) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      setAccounts(accounts.filter((a) => a.id !== account.id))
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
    { header: 'Nome da Conta', accessor: 'name' as const },
    { header: 'Banco', accessor: 'bank' as const },
    {
      header: 'Número da Conta',
      accessor: (row: BankAccount) => row.accountNumber || '-',
    },
    {
      header: 'Saldo',
      accessor: (row: BankAccount) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(row.balance)}
        </span>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
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
