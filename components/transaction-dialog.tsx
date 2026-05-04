"use client"

import { useState, useEffect } from "react"
import { categoriesAPI, accountsAPI, getUserIdFromToken } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, TrendingDown, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getIconComponent, IconPicker } from "@/components/icon-picker"

const LAST_ACCOUNT_KEY = "sharefin_last_account"

interface Transaction {
  id: number | string
  name?: string
  type?: string
  categoryId?: number | string
  accountId?: number | string
  amount?: number | string
  date?: string
}

interface TransactionFormData {
  amount: string
  type: string
  category: string
  account: string
  date: string
  name: string
}

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  onSave: (data: any) => void
}

export function TransactionDialog({ open, onOpenChange, transaction, onSave }: TransactionDialogProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: "",
    type: "saida",
    category: "",
    account: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
  })

  const [categories, setCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [formError, setFormError] = useState("")
  const [categoryError, setCategoryError] = useState("")
  const [accountError, setAccountError] = useState("")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", color: "#3b82f6", type: 1, icon: "ShoppingCart" })
  const [newAccount, setNewAccount] = useState({ name: "", currency: "BRL", color: "#3b82f6" })

  const filteredCategories = categories.filter(
    (c) => (formData.type === "saida" ? c.type === 1 : c.type === 2)
  )

  useEffect(() => {
    if (open) {
      loadCategories()
      loadAccounts()
    }
  }, [open])

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name || "",
        type: transaction.type || "saida",
        category: transaction.categoryId?.toString() || "",
        account: transaction.accountId?.toString() || "",
        amount: transaction.amount?.toString() || "",
        date: transaction.date || new Date().toISOString().split("T")[0],
      })
    } else {
      const lastAccount = typeof window !== "undefined"
        ? localStorage.getItem(LAST_ACCOUNT_KEY) || ""
        : ""
      setFormData({
        name: "",
        type: "saida",
        category: "",
        account: lastAccount,
        amount: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
    setFormError("")
  }, [transaction, open])

  // Limpa a categoria quando o tipo muda para evitar categoria incompatível
  const handleTypeChange = (newType: string) => {
    setFormData((prev) => ({ ...prev, type: newType, category: "" }))
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data.map((item: any) => ({ ...item, type: Number.parseInt(item.type) })))
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError("")

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      setFormError("Insira um valor maior que zero.")
      return
    }
    if (!formData.category) {
      setFormError("Selecione uma categoria.")
      return
    }
    if (!formData.account) {
      setFormError("Selecione uma conta bancária.")
      return
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_ACCOUNT_KEY, formData.account)
    }

    const dataToSave = { ...formData, amount: Number.parseFloat(formData.amount) || 0 }
    onSave(transaction ? { ...dataToSave, id: transaction.id } : dataToSave)
    onOpenChange(false)
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setCategoryError("Informe o nome da categoria")
      return
    }
    try {
      setCategoryError("")
      await categoriesAPI.create({
        name: newCategory.name,
        color: newCategory.color,
        type: newCategory.type,
        initial_value: 0,
        icon: newCategory.icon,
      })
      const updatedCategories = await categoriesAPI.getAll()
      const mapped = updatedCategories.map((item: any) => ({ ...item, type: Number.parseInt(item.type) }))
      setCategories(mapped)

      const created = mapped.find((c: any) => c.name === newCategory.name)
      if (created) {
        const newType = created.type === 1 ? "saida" : "entrada"
        setFormData({ ...formData, category: created.id.toString(), type: newType })
      }

      setShowCategoryDialog(false)
      setNewCategory({ name: "", color: "#3b82f6", type: 1, icon: "ShoppingCart" })
    } catch (error) {
      setCategoryError("Erro ao criar categoria. Tente novamente.")
    }
  }

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim()) {
      setAccountError("Informe o nome da conta")
      return
    }
    try {
      setAccountError("")
      const userId = getUserIdFromToken()
      if (!userId) throw new Error("User ID not found")

      await accountsAPI.create({
        user: userId,
        name: newAccount.name,
        coin: newAccount.currency,
        color: newAccount.color,
        ative: true,
      })
      const updatedAccounts = await accountsAPI.getAll()
      setAccounts(updatedAccounts)

      const created = updatedAccounts.find((a: any) => a.name === newAccount.name)
      if (created) {
        setFormData({ ...formData, account: created.id.toString() })
        localStorage.setItem(LAST_ACCOUNT_KEY, created.id.toString())
      }

      setShowAccountDialog(false)
      setNewAccount({ name: "", currency: "BRL", color: "#3b82f6" })
    } catch (error) {
      setAccountError("Erro ao criar conta: " + (error as Error).message)
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

            {/* 1. Valor */}
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
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* 2. Tipo toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("saida")}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    formData.type === "saida"
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-700"
                      : "border-border text-muted-foreground hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("entrada")}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    formData.type === "entrada"
                      ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-700"
                      : "border-border text-muted-foreground hover:border-green-300 hover:text-green-600"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Receita
                </button>
              </div>
            </div>

            {/* 3. Categoria (filtrada por tipo) */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  key={`category-${formData.type}-${formData.category}`}
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="flex-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Nenhuma categoria para este tipo
                      </div>
                    ) : (
                      filteredCategories.map((category) => {
                        const IconComponent = getIconComponent(category.icon)
                        return (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" variant="outline" onClick={() => setShowCategoryDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
                    value={newCategory.icon}
                    onChange={(icon) => setNewCategory({ ...newCategory, icon })}
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
                    <Button type="button" size="sm" onClick={handleCreateCategory} className="flex-1">Criar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Descrição (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Descrição <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Compra no supermercado"
              />
            </div>

            {/* 5. Data */}
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

            {/* 6. Conta */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-sm font-medium">
                Conta <span className="text-red-500">*</span>
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
                        {account.name}
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
                    <Button type="button" size="sm" onClick={handleCreateAccount} className="flex-1">Criar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowAccountDialog(false)} className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {formError && <p className="text-sm text-red-500 pb-2">{formError}</p>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{transaction ? "Atualizar" : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
