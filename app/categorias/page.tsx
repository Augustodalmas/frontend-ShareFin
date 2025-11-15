'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { CategoryDialog } from '@/components/category-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Category {
  id: number
  name: string
  color: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Alimentação', color: '#10b981' },
    { id: 2, name: 'Transporte', color: '#3b82f6' },
    { id: 3, name: 'Moradia', color: '#f59e0b' },
    { id: 4, name: 'Lazer', color: '#ec4899' },
    { id: 5, name: 'Saúde', color: '#ef4444' },
    { id: 6, name: 'Educação', color: '#8b5cf6' },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const handleSave = (categoryData: Omit<Category, 'id'> | Category) => {
    if ('id' in categoryData) {
      setCategories(categories.map((c) => (c.id === categoryData.id ? categoryData : c)))
    } else {
      const newCategory = { ...categoryData, id: Date.now() }
      setCategories([...categories, newCategory])
    }
    setEditingCategory(undefined)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = (category: Category) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      setCategories(categories.filter((c) => c.id !== category.id))
    }
  }

  const handleAdd = () => {
    setEditingCategory(undefined)
    setDialogOpen(true)
  }

  const columns = [
    { header: 'Nome da Categoria', accessor: 'name' as const },
    {
      header: 'Cor',
      accessor: (row: Category) => (
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg border border-border"
            style={{ backgroundColor: row.color }}
          />
          <span className="text-sm font-medium text-muted-foreground">
            {row.color}
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader
          title="Categorias"
          description="Organize suas transações por categorias"
          action={
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          }
        />

        <DataTable
          data={categories}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <CategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={editingCategory}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}
