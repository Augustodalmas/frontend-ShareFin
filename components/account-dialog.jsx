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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usersAPI } from '@/lib/api'

const currencies = [
  { value: 'BRL', label: 'Real (BRL)' },
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'Libra (GBP)' },
]

const colors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

export function AccountDialog({ open, onOpenChange, account, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    currency: 'BRL',
    color: colors[0],
    active: true,
    share: false,
    sharewith: null,
  })
  const [shareCode, setShareCode] = useState('')

  useEffect(() => {
    if (open) {
      if (account) {
        setFormData({
          name: account.name,
          currency: account.currency,
          color: account.color,
          active: account.active,
          share: account.share || false,
          sharewith: account.sharewith || null,
        })
        setShareCode('')
      } else {
        setFormData({
          name: '',
          currency: 'BRL',
          color: colors[0],
          active: true,
          share: false,
          sharewith: null,
        })
        setShareCode('')
      }
    }
  }, [account, open])



  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSave = { ...formData }
    if (formData.share && shareCode) {
      dataToSave.shareCode = shareCode
    }
    if (account) {
      onSave({ ...dataToSave, id: account.id })
    } else {
      onSave(dataToSave)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta Bancária' : 'Adicionar Conta Bancária'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Conta Corrente Principal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
              <Label htmlFor="active" className="cursor-pointer text-sm sm:text-base">Conta ativa</Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="share"
                checked={formData.share}
                onChange={(e) => {
                  setFormData({ ...formData, share: e.target.checked })
                  if (!e.target.checked) {
                    setFormData({ ...formData, share: false, sharewith: null })
                    setSelectedUserName('')
                  }
                }}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <Label htmlFor="share" className="cursor-pointer text-sm sm:text-base">Conta compartilhada</Label>
            </div>
            {formData.share && (
              <div className="space-y-2">
                <Label htmlFor="shareCode">Código de Compartilhamento</Label>
                <Input
                  id="shareCode"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  placeholder="Digite o código do usuário..."
                  required={formData.share}
                />
                <p className="text-xs text-muted-foreground">
                  Insira o código de compartilhamento do usuário
                </p>
              </div>
            )}
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
