'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usersAPI } from '@/lib/api'

type Status = 'loading' | 'success' | 'error' | 'missing'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) return

    usersAPI.confirmEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setErrorMessage(err?.message || 'Não foi possível confirmar seu email.')
        setStatus('error')
      })
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <img src="/logo-sharefin-bg.png" alt="ShareFin Logo" className="h-16 w-16" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          ShareFin <span className="text-sm text-muted-foreground font-normal">v0.0.1</span>
        </h1>

        {status === 'loading' && (
          <div className="space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Confirmando seu email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Email confirmado!</p>
              <p className="text-sm text-muted-foreground">
                Sua conta foi ativada com sucesso. Você já pode fazer login.
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Ir para o login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="h-14 w-14 text-red-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Falha na confirmação</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => router.push('/login')}>
                Ir para o login
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/register')}>
                Criar nova conta
              </Button>
            </div>
          </div>
        )}

        {status === 'missing' && (
          <div className="space-y-4">
            <XCircle className="h-14 w-14 text-yellow-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Link inválido</p>
              <p className="text-sm text-muted-foreground">
                O link de confirmação está incompleto ou expirou. Verifique seu email e tente novamente.
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Ir para o login
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
