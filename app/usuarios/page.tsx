'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { UserDialog } from '@/components/user-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  type: 'admin' | 'usuario'
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'João Silva', email: 'joao@example.com', type: 'admin' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', type: 'usuario' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@example.com', type: 'usuario' },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()

  const handleSave = (userData: Omit<User, 'id'> | User) => {
    if ('id' in userData) {
      // Edit existing user
      setUsers(users.map((u) => (u.id === userData.id ? userData : u)))
    } else {
      // Add new user
      const newUser = { ...userData, id: Date.now() }
      setUsers([...users, newUser])
    }
    setEditingUser(undefined)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter((u) => u.id !== user.id))
    }
  }

  const handleAdd = () => {
    setEditingUser(undefined)
    setDialogOpen(true)
  }

  const columns = [
    { header: 'Nome', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    {
      header: 'Tipo',
      accessor: (row: User) => (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {row.type === 'admin' ? 'Administrador' : 'Usuário'}
        </span>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader
          title="Usuários"
          description="Gerencie os usuários do sistema"
          action={
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          }
        />

        <DataTable
          data={users}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
