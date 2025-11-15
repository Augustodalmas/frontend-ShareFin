import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, Receipt, Building2, Tag } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader
          title="Dashboard"
          description="Visão geral das suas finanças"
        />

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total de Entradas"
            value="R$ 15.240,00"
            icon={TrendingUp}
            description="+12% em relação ao mês anterior"
          />
          <StatCard
            title="Total de Saídas"
            value="R$ 8.650,00"
            icon={TrendingDown}
            description="-5% em relação ao mês anterior"
          />
          <StatCard
            title="Saldo Atual"
            value="R$ 6.590,00"
            icon={Wallet}
            description="Saldo disponível em todas as contas"
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Transações
                </p>
                <p className="text-2xl font-bold text-foreground">247</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contas Cadastradas
                </p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Categorias Ativas
                </p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-8 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Transações Recentes
          </h2>
          <div className="space-y-4">
            {[
              {
                name: 'Supermercado',
                category: 'Alimentação',
                date: '15/11/2025',
                amount: '-R$ 240,00',
                type: 'saída',
              },
              {
                name: 'Salário',
                category: 'Renda',
                date: '14/11/2025',
                amount: '+R$ 5.000,00',
                type: 'entrada',
              },
              {
                name: 'Conta de Luz',
                category: 'Utilidades',
                date: '13/11/2025',
                amount: '-R$ 180,00',
                type: 'saída',
              },
              {
                name: 'Freelance',
                category: 'Renda Extra',
                date: '12/11/2025',
                amount: '+R$ 800,00',
                type: 'entrada',
              },
            ].map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    transaction.type === 'entrada'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
