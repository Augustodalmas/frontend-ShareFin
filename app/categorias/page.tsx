'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { CategoryDialog } from '@/components/category-dialog'
import { MobileFilters } from '@/components/mobile-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { categoriesAPI } from '@/lib/api'
import { getIconComponent } from '@/components/icon-picker'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Category {
  id: number
  name: string
  color: string
  type: 1 | 2
  icon?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [typeFilter, setTypeFilter] = useState<'1' | '2'>('2')
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [typeFilter])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll({ type: typeFilter })
      const mapped = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        type: parseInt(item.type),
        icon: item.icon,
      }))
      setCategories(mapped)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const handleSave = async (categoryData: Omit<Category, 'id'> | Category) => {
    try {
      const payload = {
        name: categoryData.name,
        color: categoryData.color,
        type: categoryData.type,
        initial_value: 0,
        icon: categoryData.icon || 'ShoppingCart',
      }
      if ('id' in categoryData) {
        await categoriesAPI.update(categoryData.id, payload)
        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso.",
        })
      } else {
        await categoriesAPI.create(payload)
        toast({
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso.",
        })
      }
      await loadCategories()
      setEditingCategory(undefined)
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a categoria. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    setConfirmOpen(false)
    try {
      await categoriesAPI.delete(categoryToDelete.id)
      toast({ title: "Categoria excluída", description: "A categoria foi excluída com sucesso." })
      await loadCategories()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir a categoria. Tente novamente.", variant: "destructive" })
    } finally {
      setCategoryToDelete(null)
    }
  }

  const handleAdd = () => {
    setEditingCategory(undefined)
    setDialogOpen(true)
  }

  const columns = [
    {
      header: 'Nome da Categoria',
      accessor: (row: Category) => {
        const IconComponent = getIconComponent(row.icon)
        return (
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: row.color }} />
            <span className="text-sm sm:text-base">{row.name}</span>
          </div>
        )
      },
    },
    {
      header: 'type',
      accessor: (row: Category) => (
        <span className="text-xs sm:text-sm text-muted-foreground">
          {row.type === 1 ? 'Despesa' : 'Receita'}
        </span>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Categorias"
          description="Organize suas transações por categorias"
        />

        <MobileFilters>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-muted-foreground">type:</span>
            <div className="inline-flex rounded-lg border border-border bg-card p-1 flex-1">
              <button
                onClick={() => setTypeFilter('2')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${typeFilter === '2'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setTypeFilter('1')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${typeFilter === '1'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Despesas
              </button>
            </div>
          </div>
        </MobileFilters>

        <div className="hidden lg:block mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">type:</span>
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              <button
                onClick={() => setTypeFilter('2')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${typeFilter === '2'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setTypeFilter('1')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${typeFilter === '1'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Despesas
              </button>
            </div>
          </div>
        </div>

        <DataTable
          data={categories}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          addButtonText="Nova Categoria"
          emptyMessage="Nenhuma categoria cadastrada"
          emptyDescription="Crie categorias para organizar suas transações por tipo"
        />

        <CategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={editingCategory}
          onSave={handleSave}
        />

        <ConfirmDialog
          open={confirmOpen}
          title="Excluir categoria"
          description={`Tem certeza que deseja excluir "${categoryToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={confirmDelete}
          onCancel={() => { setConfirmOpen(false); setCategoryToDelete(null) }}
        />
      </main>
    </div>
  )
}
