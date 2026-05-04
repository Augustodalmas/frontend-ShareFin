"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { TransactionDialog } from "@/components/transaction-dialog"
import { transactionsAPI, getUserIdFromToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const PUBLIC_ROUTES = ["/login", "/register"]

export function GlobalFAB() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null
  if (PUBLIC_ROUTES.includes(pathname)) return null

  const handleSave = async (transactionData: any) => {
    try {
      const userId = getUserIdFromToken()
      if (!userId) throw new Error("Sessão expirada. Faça login novamente.")

      await transactionsAPI.create({
        account: Number.parseInt(transactionData.account),
        category: Number.parseInt(transactionData.category),
        value: transactionData.type === "entrada" ? transactionData.amount : -transactionData.amount,
        name: transactionData.name,
        date_transaction: transactionData.date,
      })

      setOpen(false)
      toast({ title: "Transação criada", description: "Adicionada com sucesso." })

      // Recarrega a página atual para refletir a nova transação
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a transação.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-150 lg:bottom-8 lg:right-8"
        aria-label="Nova transação"
      >
        <Plus className="h-6 w-6" />
      </button>

      <TransactionDialog open={open} onOpenChange={setOpen} onSave={handleSave} />
    </>
  )
}
