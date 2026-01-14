'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usersAPI, accountsAPI, transactionsAPI, getUserIdFromToken } from '@/lib/api'
import { User, Wallet, Lock, Copy, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  const [formData, setFormData] = useState({ nome: '', email: '' })
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadUserData()
    loadBalance()
  }, [])

  const loadUserData = async () => {
    try {
      const userId = getUserIdFromToken()
      if (!userId) return

      const data = await usersAPI.getById(userId)
      const currentUser = Array.isArray(data) ? data[0] : data
      setUser(currentUser)
      setFormData({ nome: currentUser.nome, email: currentUser.email })
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    }
  }

  const handleCopyCode = () => {
    if (user?.shareCode) {
      navigator.clipboard.writeText(user.shareCode)
      setCopiedCode(true)
      toast({
        title: "Código copiado",
        description: "O código de compartilhamento foi copiado para a área de transferência.",
      })
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const loadBalance = async () => {
    try {
      const userId = getUserIdFromToken()
      if (!userId) return

      const data = await transactionsAPI.getAll({ usuario: userId })

      const list = Array.isArray(data)
        ? data
        : data.resultado || []

      const balance = list.reduce((acc: number, t: any) => {
        return acc + t.valor
      }, 0)

      setBalance(balance)
    } catch (error) {
      console.error('Erro ao carregar saldo:', error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      const payload: any = { nome: formData.nome, email: formData.email }
      if (user.is_admin !== undefined && user.is_admin !== null) {
        payload.is_admin = user.is_admin
      }
      await usersAPI.update(user.id, payload)
      await loadUserData()
      setEditMode(false)
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      })
      return
    }
    if (!user) return
    setLoading(true)
    try {
      const payload: any = { senha_antiga: passwordData.oldPassword, senha: passwordData.newPassword }
      if (user.is_admin !== undefined && user.is_admin !== null) {
        payload.is_admin = user.is_admin
      }
      await usersAPI.update(user.id, payload)
      setChangePassword(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast({
        title: "Erro ao alterar senha",
        description: "Verifique se a senha antiga está correta e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <FeedbackWidget />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader title="Perfil" description="Gerencie suas informações pessoais" />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Saldo Total
              </CardTitle>
              <CardDescription>Soma de todas as suas contas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações de Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                <p className="font-medium">{new Date(user.criado_em).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="font-medium">{new Date(user.atualizado_em).toLocaleDateString('pt-BR')}</p>
              </div>
              {user.shareCode && (
                <div>
                  <p className="text-sm text-muted-foreground">Código de Compartilhamento</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-3 py-1 rounded font-mono">{user.shareCode}</code>
                    <button
                      onClick={handleCopyCode}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar código"
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editMode}
              />
            </div>
            <div className="flex gap-2">
              {!editMode ? (
                <Button onClick={() => setEditMode(true)}>Editar</Button>
              ) : (
                <>
                  <Button onClick={handleUpdateProfile} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditMode(false); setFormData({ nome: user.nome, email: user.email }) }}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>Mantenha sua conta segura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!changePassword ? (
              <Button onClick={() => setChangePassword(true)}>Alterar Senha</Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Senha Atual</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={loading}>
                    {loading ? 'Alterando...' : 'Confirmar'}
                  </Button>
                  <Button variant="outline" onClick={() => { setChangePassword(false); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }) }}>
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
