'use client'

import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function AssistentePage() {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Assistente Financeiro IA"
          description="Seu assistente inteligente para decisões financeiras"
        />

        <Card className="p-12 sm:p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
          <Sparkles className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Em Breve
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md">
            Estamos desenvolvendo um assistente inteligente para ajudá-lo com suas finanças. Em breve você terá acesso a insights e recomendações personalizadas.
          </p>
        </Card>
      </main>
    </div>
  )
}
