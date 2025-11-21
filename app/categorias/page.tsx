'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { CategoryDialog } from '@/components/category-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { categoriesAPI } from '@/lib/api'

interface Category {
  id: number
  name: string
  color: string
  type: 1 | 2
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.nome,
        color: item.cor,
        type: parseInt(item.tipo),
      }))
      setCategories(mapped)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const handleSave = async (categoryData: Omit<Category, 'id'> | Category) => {
    try {
      const payload = {
        nome: categoryData.name,
        cor: categoryData.color,
        tipo: categoryData.type,
        valor_inicial: 0,
      }
      if ('id' in categoryData) {
        await categoriesAPI.update(categoryData.id, payload)
      } else {
        await categoriesAPI.create(payload)
      }
      await loadCategories()
      setEditingCategory(undefined)
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await categoriesAPI.delete(category.id)
        await loadCategories()
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
      }
    }
  }

  const handleAdd = () => {
    setEditingCategory(undefined)
    setDialogOpen(true)
  }

  const columns = [
    { header: 'Nome da Categoria', accessor: 'name' as const, className: 'text-sm sm:text-base' },
    {
      header: 'Tipo',
      accessor: (row: Category) => (
        <span className="text-xs sm:text-sm text-muted-foreground">
          {row.type === 1 ? 'Despesa' : 'Receita'}
        </span>
      ),
    },
    {
      header: 'Cor',
      accessor: (row: Category) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg border border-border flex-shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden md:inline">
            {row.color}
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
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
