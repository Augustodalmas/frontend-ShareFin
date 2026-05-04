'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usersAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres'
    if (!/[a-zA-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra'
    if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número'
    if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula'
    if (!/[!@#$%^&*()\-_=+\[\]{}|;':",.<>/?]/.test(password)) return 'A senha deve conter pelo menos um caractere especial'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const passwordError = validatePassword(senha)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      await usersAPI.create({
        name: nome,
        email,
        password: senha
      })
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Confirme sua conta pelo email enviado para continuar.',
      })
      router.push('/login')
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err)
      setError(err?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <img src="/logo-sharefin-bg.png" alt="ShareFin Logo" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            ShareFin <span className="text-sm text-muted-foreground font-normal">v0.0.1</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {senha && (
              <ul className="text-xs space-y-0.5 mt-1">
                {[
                  { ok: senha.length >= 8, label: 'Mínimo 8 caracteres' },
                  { ok: /[A-Z]/.test(senha), label: 'Pelo menos uma maiúscula' },
                  { ok: /[0-9]/.test(senha), label: 'Pelo menos um número' },
                  { ok: /[!@#$%^&*()\-_=+\[\]{}|;':",.<>/?]/.test(senha), label: 'Pelo menos um caractere especial' },
                ].map(({ ok, label }) => (
                  <li key={label} className={ok ? 'text-green-600' : 'text-muted-foreground'}>
                    {ok ? '✓' : '○'} {label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmSenha">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmSenha"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
