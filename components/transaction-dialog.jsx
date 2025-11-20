'use client'

import { useState, useEffect } from 'react'
import { categoriesAPI, accountsAPI } from '@/lib/api'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TransactionDialog({ open, onOpenChange, transaction, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'saida',
    category: '',
    account: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  })
  
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    if (open) {
      loadCategories()
      loadAccounts()
    }
  }, [open])

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        type: transaction.type,
        category: transaction.categoryId?.toString() || '',
        account: transaction.accountId?.toString() || '',
        amount: transaction.amount,
        date: transaction.date,
      })
    } else {
      setFormData({
        name: '',
        type: 'saida',
        category: '',
        account: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [transaction, open])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      const mapped = data.map((item) => ({
        ...item,
        tipo: parseInt(item.tipo)
      }))
      setCategories(mapped)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadAccounts = async () => {
    try {
      const data = await accountsAPI.getAll()
      setAccounts(data)
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (transaction) {
      onSave({ ...formData, id: transaction.id })
    } else {
      onSave(formData)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Transação</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Compra no supermercado"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={formData.type === 'entrada' ? 'Receita' : 'Despesa'}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  const selectedCategory = categories.find(c => c.id.toString() === value)
                  const newType = selectedCategory?.tipo === 1 ? 'saida' : 'entrada'
                  setFormData({ ...formData, category: value, type: newType })
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.nome} ({category.tipo === 1 ? 'Despesa' : 'Receita'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Conta Bancária</Label>
              <Select
                value={formData.account}
                onValueChange={(value) =>
                  setFormData({ ...formData, account: value })
                }
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
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
