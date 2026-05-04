'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-gerenciadorfinanceiro-production.up.railway.app/api/v1'

export function FeedbackWidget({ open, onOpenChange }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  const handleClose = () => {
    onOpenChange(false)
    setTitulo('')
    setDescricao('')
    setSuccess(false)
    setFeedbackError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, descricao }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.erro || body.error || 'Erro ao enviar feedback')
      }

      setSuccess(true)
      setTimeout(handleClose, 2000)
    } catch (error) {
      setFeedbackError(error.message || 'Erro ao enviar feedback. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <p className="text-green-600 font-medium">Feedback enviado com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" onChange={() => setFeedbackError('')}>
            <div className="space-y-2">
              <Label htmlFor="titulo">Tipo</Label>
              <Select value={titulo} onValueChange={setTitulo} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Melhoria">Melhoria</SelectItem>
                  <SelectItem value="Erro">Erro</SelectItem>
                  <SelectItem value="Ajuda">Ajuda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva seu feedback..."
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {feedbackError && (
              <p className="text-sm text-red-500">{feedbackError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !titulo || !descricao}>
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
