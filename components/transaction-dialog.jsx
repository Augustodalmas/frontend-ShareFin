"use client"

import { useState, useEffect } from "react"
import { categoriesAPI, accountsAPI, getUserIdFromToken } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getIconComponent, IconPicker } from "@/components/icon-picker"

export function TransactionDialog({ open, onOpenChange, transaction, onSave }) {
  const [formData, setFormData] = useState({
    amount: "",
    type: "saida",
    category: "",
    account: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
  })

  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categoryError, setCategoryError] = useState("")
  const [accountError, setAccountError] = useState("")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", color: "#3b82f6", type: 1, icone: "ShoppingCart" })
  const [newAccount, setNewAccount] = useState({ name: "", currency: "BRL", color: "#3b82f6" })

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
        category: transaction.categoryId?.toString() || "",
        account: transaction.accountId?.toString() || "",
        amount: transaction.amount,
        date: transaction.date,
      })
    } else {
      setFormData({
        name: "",
        type: "saida",
        category: "",
        account: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [transaction, open])

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      const mapped = data.map((item) => ({
        ...item,
        tipo: Number.parseInt(item.tipo),
      }))
      setCategories(mapped)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const loadAccounts = async () => {
    try {
      const data = await accountsAPI.getAll()
      setAccounts(data)
    } catch (error) {
      console.error("Erro ao carregar contas:", error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      alert("Valor inválido. Por favor, insira um valor maior que zero.")
      return
    }

    if (!formData.category) {
      alert("Por favor, selecione uma categoria.")
      return
    }

    if (!formData.account) {
      alert("Por favor, selecione uma conta bancária.")
      return
    }

    const dataToSave = {
      ...formData,
      amount: Number.parseFloat(formData.amount) || 0,
    }
    if (transaction) {
      onSave({ ...dataToSave, id: transaction.id })
    } else {
      onSave(dataToSave)
    }
    onOpenChange(false)
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setCategoryError("Informe o nome da categoria")
      return
    }

    try {
      setCategoryError("") // limpa erro anterior

      const created = await categoriesAPI.create({
        nome: newCategory.name,
        cor: newCategory.color,
        tipo: newCategory.type,
        valor_inicial: 0,
        icone: newCategory.icone,
      })

      const updatedCategories = await categoriesAPI.getAll()
      const mapped = updatedCategories.map((item) => ({
        ...item,
        tipo: Number.parseInt(item.tipo),
      }))
      setCategories(mapped)

      const createdId = created?.id || mapped[mapped.length - 1]?.id
      if (createdId) {
        const newType = newCategory.type === 1 ? "saida" : "entrada"
        setFormData({ ...formData, category: createdId.toString(), type: newType })
      }

      setShowCategoryDialog(false)
      setNewCategory({ name: "", color: "#3b82f6", type: 1, icone: "ShoppingCart" })
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      setCategoryError("Erro ao criar categoria. Tente novamente.")
    }
  }

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim()) {
      setAccountError("Informe o nome da conta")
      return
    }
    try {
      setAccountError("") // limpa erro anterior
      const userId = getUserIdFromToken()
      if (!userId) {
        throw new Error("User ID not found")
      }

      const created = await accountsAPI.create({
        user: userId,
        nome: newAccount.name,
        moeda: newAccount.currency,
        cor: newAccount.color,
        ativa: true,
      })
      const updatedAccounts = await accountsAPI.getAll()
      setAccounts(updatedAccounts)

      const createdId = created?.id || updatedAccounts[updatedAccounts.length - 1]?.id
      if (createdId) {
        setFormData({ ...formData, account: createdId.toString() })
      }
      setShowAccountDialog(false)
      setNewAccount({ name: "", currency: "BRL", color: "#3b82f6" })
    } catch (error) {
      console.error("Erro ao criar conta:", error)
      alert("Erro ao criar conta: " + error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* 1. Valor (most important) */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Valor <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="0,00"
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">Insira o valor da transação</p>
            </div>

            {/* 2. Tipo (entrada/saída) - View Only */}
            {formData.category && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tipo da Transação
                </Label>
                <div className={`px-4 py-3 rounded-lg border-2 font-medium text-sm flex items-center gap-2 ${
                  formData.type === "saida"
                    ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                    : "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900"
                }`}>
                  {formData.type === "saida" ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>{formData.type === "saida" ? "Despesa" : "Receita"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Definido automaticamente pela categoria selecionada</p>
              </div>
            )}

            {/* 3. Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  key={`category-${formData.category}`}
                  value={formData.category}
                  onValueChange={(value) => {
                    const selectedCategory = categories.find((c) => c.id.toString() === value)
                    const newType = selectedCategory?.tipo === 1 ? "saida" : "entrada"
                    setFormData({ ...formData, category: value, type: newType })
                  }}
                >
                  <SelectTrigger id="category" className="flex-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      const IconComponent = getIconComponent(category.icone)
                      return (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" style={{ color: category.cor }} />
                            <span>{category.nome}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" variant="outline" onClick={() => setShowCategoryDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Se não existir, crie uma nova categoria</p>
              {showCategoryDialog && (
                <div className="border rounded-lg p-3 space-y-3 bg-muted/50">
                  <Input
                    placeholder="Nome da categoria"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  {categoryError && <p className="text-sm text-red-500">{categoryError}</p>}
                  <select
                    className="w-full px-3 py-2 rounded-md border bg-background"
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({ ...newCategory, type: Number.parseInt(e.target.value) })}
                  >
                    <option value={1}>Despesa</option>
                    <option value={2}>Receita</option>
                  </select>
                  <IconPicker
                    value={newCategory.icone}
                    onChange={(icone) => setNewCategory({ ...newCategory, icone })}
                  />
                  <div>
                    <Label className="text-xs">Cor</Label>
                    <Input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleCreateCategory} className="flex-1">
                      Criar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCategoryDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Conta Bancária */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-sm font-medium">
                Conta Bancária <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  key={`account-${formData.account}`}
                  value={formData.account}
                  onValueChange={(value) => setFormData({ ...formData, account: value })}
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
                  <Input
                    placeholder="Nome da conta"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  />
                  {accountError && <p className="text-sm text-red-500">{accountError}</p>}
                  <Input
                    placeholder="Moeda (ex: BRL)"
                    value={newAccount.currency}
                    onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                  />
                  <Input
                    type="color"
                    value={newAccount.color}
                    onChange={(e) => setNewAccount({ ...newAccount, color: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleCreateAccount} className="flex-1">
                      Criar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAccountDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Data (prefilled with today) */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* 6. Descrição (optional, last) */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Descrição <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Compra no supermercado"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{transaction ? "Atualizar" : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
