'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconPicker } from '@/components/icon-picker'

const colorOptions = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Ciano', value: '#06b6d4' },
]

interface Category {
  id: number | string
  name: string
  color: string
  type: number
  icone?: string
}

interface CategoryFormData {
  name: string
  color: string
  type: number
  icone: string
}

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSave: (data: any) => void
}

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: colorOptions[0].value,
    type: 1,
    icone: 'ShoppingCart',
  })

  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          name: category.name,
          color: category.color,
          type: category.type,
          icone: category.icone || 'ShoppingCart',
        })
      } else {
        setFormData({
          name: '',
          color: colorOptions[0].value,
          type: 1,
          icone: 'ShoppingCart',
        })
      }
    }
  }, [open, category])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (category) {
      onSave({ ...formData, id: category.id })
    } else {
      onSave(formData)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Alimentação"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    formData.type === 1
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-border hover:border-foreground/50'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 1 })}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    formData.type === 2
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-border hover:border-foreground/50'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 2 })}
                >
                  Receita
                </button>
              </div>
            </div>
            <IconPicker
              value={formData.icone}
              onChange={(icone) => setFormData({ ...formData, icone })}
            />
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`flex h-12 items-center justify-center rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-foreground ring-2 ring-ring'
                        : 'border-border hover:border-foreground/50'
                    }`}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    style={{ backgroundColor: color.value }}
                  >
                    {formData.color === color.value && (
                      <span className="text-xs font-medium text-white">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
