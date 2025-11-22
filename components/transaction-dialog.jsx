'use client'

import { useState, useEffect } from 'react'
import { categoriesAPI, accountsAPI, getUserIdFromToken } from '@/lib/api'
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
import { Plus } from 'lucide-react'
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
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })
  
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6', type: 1 })
  const [newAccount, setNewAccount] = useState({ name: '', currency: 'BRL', color: '#3b82f6' })

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
        amount: '',
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
    const dataToSave = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    }
    if (transaction) {
      onSave({ ...dataToSave, id: transaction.id })
    } else {
      onSave(dataToSave)
    }
    onOpenChange(false)
  }

  const handleCreateCategory = async () => {
    try {
      const created = await categoriesAPI.create({
        nome: newCategory.name,
        cor: newCategory.color,
        tipo: newCategory.type,
        valor_inicial: 0
      })
      const updatedCategories = await categoriesAPI.getAll()
      const mapped = updatedCategories.map((item) => ({
        ...item,
        tipo: parseInt(item.tipo)
      }))
      setCategories(mapped)
      
      const createdId = created?.id || mapped[mapped.length - 1]?.id
      if (createdId) {
        const newType = newCategory.type === 1 ? 'saida' : 'entrada'
        setFormData({ ...formData, category: createdId.toString(), type: newType })
      }
      setShowCategoryDialog(false)
      setNewCategory({ name: '', color: '#3b82f6', type: 1 })
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    }
  }

  const handleCreateAccount = async () => {
    try {
      const userId = getUserIdFromToken()
      if (!userId) {
        throw new Error('User ID not found')
      }
      const created = await accountsAPI.create({
        user: userId,
        nome: newAccount.name,
        moeda: newAccount.currency,
        cor: newAccount.color,
        ativa: true
      })
      const updatedAccounts = await accountsAPI.getAll()
      setAccounts(updatedAccounts)
      
      const createdId = created?.id || updatedAccounts[updatedAccounts.length - 1]?.id
      if (createdId) {
        setFormData({ ...formData, account: createdId.toString() })
      }
      setShowAccountDialog(false)
      setNewAccount({ name: '', currency: 'BRL', color: '#3b82f6' })
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      alert('Erro ao criar conta: ' + error.message)
    }
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
                      amount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <div className="flex gap-2">
                <Select
                  key={`category-${formData.category}`}
                  value={formData.category}
                  onValueChange={(value) => {
                    const selectedCategory = categories.find(c => c.id.toString() === value)
                    const newType = selectedCategory?.tipo === 1 ? 'saida' : 'entrada'
                    setFormData({ ...formData, category: value, type: newType })
                  }}
                >
                  <SelectTrigger id="category" className="flex-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" variant="outline" onClick={() => setShowCategoryDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showCategoryDialog && (
                <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
                  <Input placeholder="Nome da categoria" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} />
                  <select className="w-full px-3 py-2 rounded-md border" value={newCategory.type} onChange={(e) => setNewCategory({...newCategory, type: parseInt(e.target.value)})}>
                    <option value={1}>Despesa</option>
                    <option value={2}>Receita</option>
                  </select>
                  <Input type="color" value={newCategory.color} onChange={(e) => setNewCategory({...newCategory, color: e.target.value})} />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleCreateCategory} className="flex-1">Criar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Conta Bancária</Label>
              <div className="flex gap-2">
                <Select
                  key={`account-${formData.account}`}
                  value={formData.account}
                  onValueChange={(value) =>
                    setFormData({ ...formData, account: value })
                  }
                >
                  <SelectTrigger id="account" className="flex-1">
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
                <Button type="button" size="icon" variant="outline" onClick={() => setShowAccountDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showAccountDialog && (
                <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
                  <Input placeholder="Nome da conta" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} />
                  <Input placeholder="Moeda (ex: BRL)" value={newAccount.currency} onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})} />
                  <Input type="color" value={newAccount.color} onChange={(e) => setNewAccount({...newAccount, color: e.target.value})} />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleCreateAccount} className="flex-1">Criar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowAccountDialog(false)} className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}
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
