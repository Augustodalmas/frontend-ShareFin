'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { UserDialog } from '@/components/user-dialog'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { usersAPI, isAdmin } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  type: 'admin' | 'usuario'
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    const adminStatus = isAdmin()
    if (!adminStatus) {
      router.push('/')
      return
    }
    setUserIsAdmin(adminStatus)
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll()
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        type: item.ative ? 'admin' : 'usuario',
      }))
      setUsers(mapped)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()

  const handleSave = async (userData: Omit<User, 'id'> | User) => {
    try {
      const payload = {
        nome: userData.name,
        email: userData.email,
        ativo: userData.type === 'admin' ? 1 : 0,
      }
      if ('id' in userData) {
        await usersAPI.update(userData.id, payload)
      } else {
        await usersAPI.create(payload)
      }
      await loadUsers()
      setEditingUser(undefined)
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usersAPI.delete(user.id)
        await loadUsers()
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  const handleAdd = () => {
    setEditingUser(undefined)
    setDialogOpen(true)
  }

  const columns = [
    { header: 'Nome', accessor: 'name' as const, className: 'text-sm sm:text-base' },
    { header: 'Email', accessor: 'email' as const, className: 'text-xs sm:text-sm hidden sm:table-cell' },
    {
      header: 'Tipo',
      accessor: (row: User) => (
        <span className="rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-xs font-medium text-primary">
          {row.type === 'admin' ? 'Admin' : 'Usuário'}
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
          title="Usuários"
          description={userIsAdmin ? "Gerencie os usuários do sistema" : "Visualize seu perfil"}
          action={
            userIsAdmin ? (
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            ) : undefined
          }
        />

        <DataTable
          data={users}
          columns={columns}
        // onEdit={userIsAdmin ? handleEdit : undefined}
        // onDelete={userIsAdmin ? handleDelete : undefined}
        />

        <UserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={editingUser}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}
