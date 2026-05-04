'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { AccountDialog } from '@/components/account-dialog'
import { MobileFilters } from '@/components/mobile-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { accountsAPI, getUserIdFromToken } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'

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
  const { toast } = useToast()
  const [filters, setFilters] = useState({
    name: '',
    coin: '',
    ative: '',
    share: '',
  })

  useEffect(() => {
    const savedFilters = localStorage.getItem('accountFilters')
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters))
    }
  }, [])

  useEffect(() => {
    loadAccounts()
    localStorage.setItem('accountFilters', JSON.stringify(filters))
  }, [filters])

  const loadAccounts = async () => {
    try {
      const params: any = {}
      if (filters.name) params.name = filters.name
      if (filters.coin) params.coin = filters.coin
      if (filters.ative) params.ative = filters.ative
      if (filters.share) params.share = filters.share

      const data = await accountsAPI.getAll(Object.keys(params).length > 0 ? params : undefined)
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        currency: item.coin,
        color: item.cor,
        active: item.ative,
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null)

  const handleSave = async (accountData: any) => {
    try {
      const userId = getUserIdFromToken()

      const payload: any = {
        user: userId,
        name: accountData.name,
        coin: accountData.currency,
        cor: accountData.color,
        ative: accountData.active,
        share: accountData.share,
      }

      if (accountData.share && accountData.shareCode) {
        payload.shareCode = accountData.shareCode
      }

      if ('id' in accountData) {
        const { user, ...updatePayload } = payload
        await accountsAPI.update(accountData.id, updatePayload)
        toast({
          title: "Conta atualizada",
          description: "A conta foi atualizada com sucesso.",
        })
      } else {
        if (!userId) {
          throw new Error('User ID not found in token. Please login again.')
        }

        await accountsAPI.create(payload)
        toast({
          title: "Conta criada",
          description: "A conta foi criada com sucesso.",
        })
      }
      await loadAccounts()
      setEditingAccount(undefined)
      setDialogOpen(false)
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error)
      const isInvalidShareCode = error?.message?.toLowerCase().includes('compartilhamento') || error?.message?.includes('404')
      toast({
        title: "Erro ao salvar",
        description: isInvalidShareCode
          ? "Código de compartilhamento não encontrado. Verifique e tente novamente."
          : "Não foi possível salvar a conta. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleDelete = (account: BankAccount) => {
    setAccountToDelete(account)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!accountToDelete) return
    setConfirmOpen(false)
    try {
      await accountsAPI.delete(accountToDelete.id)
      toast({ title: "Conta excluída", description: "A conta foi excluída com sucesso." })
      await loadAccounts()
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir a conta. Tente novamente.", variant: "destructive" })
    } finally {
      setAccountToDelete(null)
    }
  }

  const handleAdd = () => {
    setEditingAccount(undefined)
    setDialogOpen(true)
  }

  const clearFilters = () => {
    setFilters({ name: '', coin: '', ative: '', share: '' })
  }

  const hasActiveFilters = filters.name || filters.coin || filters.ative || filters.share

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const columns = [
    { header: 'Nome da Conta', accessor: 'name' as const, className: 'text-sm sm:text-base' },
    { header: 'coin', accessor: 'currency' as const, className: 'text-sm hidden sm:table-cell' },
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
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Contas Bancárias"
          description="Gerencie suas contas bancárias"
        />

        <MobileFilters hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}>
          <input
            type="text"
            placeholder="Filtrar por nome..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Filtrar por moeda..."
            value={filters.coin}
            onChange={(e) => setFilters({ ...filters, coin: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={filters.ative}
            onChange={(e) => setFilters({ ...filters, ative: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas (Ativa/Inativa)</option>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
          <select
            value={filters.share}
            onChange={(e) => setFilters({ ...filters, share: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas (Compartilhamento)</option>
            <option value="true">Compartilhadas</option>
            <option value="false">Não compartilhadas</option>
          </select>
        </MobileFilters>

        <div className="hidden lg:block mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Filtrar por nome..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              placeholder="Filtrar por moeda..."
              value={filters.coin}
              onChange={(e) => setFilters({ ...filters, coin: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={filters.ative}
              onChange={(e) => setFilters({ ...filters, ative: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas (Ativa/Inativa)</option>
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
            <select
              value={filters.share}
              onChange={(e) => setFilters({ ...filters, share: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas (Compartilhamento)</option>
              <option value="true">Compartilhadas</option>
              <option value="false">Não compartilhadas</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>

        <DataTable
          data={accounts}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          addButtonText="Adicionar Conta"
          emptyMessage="Nenhuma conta cadastrada"
          emptyDescription="Crie sua primeira conta bancária para começar a registrar transações"
        />

        <AccountDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          account={editingAccount}
          onSave={handleSave}
        />

        <ConfirmDialog
          open={confirmOpen}
          title="Excluir conta"
          description={`Tem certeza que deseja excluir "${accountToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={confirmDelete}
          onCancel={() => { setConfirmOpen(false); setAccountToDelete(null) }}
        />
      </main>
    </div>
  )
}
