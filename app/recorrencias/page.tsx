'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { recurrenceAPI, accountsAPI, categoriesAPI } from '@/lib/api'
import { Target } from 'lucide-react'

interface Recurrence {
  id: number
  obs: string
  valor: number
  conta: string
  categoria: string
  data_inicio: string
  data_fim: string
  data_vencimento: string
  conta_id?: number
  categoria_id?: number
}

// export default function RecurrencesPage() {
//   const [recurrences, setRecurrences] = useState<Recurrence[]>([])
//   const [accounts, setAccounts] = useState<any[]>([])
//   const [categories, setCategories] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [editingRecurrence, setEditingRecurrence] = useState<Recurrence | null>(null)
//   const [formData, setFormData] = useState({
//     obs: '',
//     valor: '',
//     conta: '',
//     categoria: '',
//     data_inicio: '',
//     data_fim: '',
//     data_vencimento: '',
//   })

//   useEffect(() => {
//     loadData()
//   }, [])

//   const loadData = async () => {
//     try {
//       const [recurrencesData, accountsData, categoriesData] = await Promise.all([
//         recurrenceAPI.getAll(),
//         accountsAPI.getAll(),
//         categoriesAPI.getAll(),
//       ])
//       console.log(recurrencesData)

//       const mapped = recurrencesData.map((rec: any) => ({
//         id: rec.id,
//         obs: rec.obs,
//         valor: rec.valor,
//         conta: accountsData.find((a: any) => a.id === rec.conta)?.nome || rec.conta,
//         categoria: categoriesData.find((c: any) => c.id === rec.categoria)?.nome || rec.categoria,
//         data_inicio: rec.data_inicio,
//         data_fim: rec.data_fim,
//         data_vencimento: rec.data_vencimento,
//         conta_id: rec.conta,
//         categoria_id: rec.categoria,
//       }))

//       setRecurrences(mapped)
//       setAccounts(accountsData)
//       setCategories(categoriesData)
//     } catch (error) {
//       console.error('Erro ao carregar dados:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleOpenDialog = (recurrence?: Recurrence) => {
//     if (recurrence) {
//       setEditingRecurrence(recurrence)
//       setFormData({
//         obs: recurrence.obs,
//         valor: Math.abs(recurrence.valor).toString(),
//         conta: (recurrence.conta_id || '').toString(),
//         categoria: (recurrence.categoria_id || '').toString(),
//         data_inicio: recurrence.data_inicio.split('T')[0],
//         data_fim: recurrence.data_fim.split('T')[0],
//         data_vencimento: recurrence.data_vencimento.split('T')[0],
//       })
//     } else {
//       setEditingRecurrence(null)
//       setFormData({
//         obs: '',
//         valor: '',
//         conta: '',
//         categoria: '',
//         data_inicio: '',
//         data_fim: '',
//         data_vencimento: '',
//       })
//     }
//     setDialogOpen(true)
//   }

//   const handleSave = async () => {
//     try {
//       const userId = getUserIdFromToken()
//       if (!userId) throw new Error('Usuário não autenticado')

//       const payload = {
//         user: userId,
//         conta: parseInt(formData.conta),
//         categoria: parseInt(formData.categoria),
//         valor: parseFloat(formData.valor),
//         obs: formData.obs,
//         data_inicio: formData.data_inicio,
//         data_fim: formData.data_fim,
//         data_vencimento: formData.data_vencimento,
//       }

//       if (editingRecurrence) {
//         await recurrenceAPI.update(editingRecurrence.id, payload)
//       } else {
//         await recurrenceAPI.create(payload)
//       }

//       setDialogOpen(false)
//       await loadData()
//     } catch (error) {
//       console.error('Erro ao salvar recorrência:', error)
//       alert('Erro ao salvar recorrência')
//     }
//   }

//   const handleDelete = async (id: number) => {
//     if (!confirm('Deseja realmente excluir esta recorrência?')) return
//     try {
//       await recurrenceAPI.delete(id)
//       await loadData()
//     } catch (error) {
//       console.error('Erro ao excluir recorrência:', error)
//       alert('Erro ao excluir recorrência')
//     }
//   }

//   const getUserIdFromToken = () => {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
//     if (!token) return null
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]))
//       return payload.id
//     } catch {
//       return null
//     }
//   }

//   const formatCurrency = (value: number) => {
//     return new Intl.NumberFormat('pt-BR', {
//       style: 'currency',
//       currency: 'BRL',
//     }).format(value)
//   }

//   const formatDate = (date: string) => {
//     return new Date(date).toLocaleDateString('pt-BR')
//   }

//   const columns = [
//     {
//       header: 'Descrição',
//       accessor: (row: Recurrence) => (
//         <div className="min-w-0">
//           <p className="font-medium text-foreground text-xs sm:text-sm truncate">{row.obs}</p>
//           <p className="text-xs text-muted-foreground truncate">{row.categoria}</p>
//         </div>
//       ),
//     },
//     {
//       header: 'Conta',
//       accessor: 'conta' as const,
//       className: 'text-muted-foreground text-xs sm:text-sm hidden sm:table-cell',
//     },
//     {
//       header: 'Valor',
//       accessor: (row: Recurrence) => (
//         <span className={`text-xs sm:text-sm font-semibold ${row.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//           {formatCurrency(row.valor)}
//         </span>
//       ),
//     },
//     {
//       header: 'Vencimento',
//       accessor: (row: Recurrence) => formatDate(row.data_vencimento),
//       className: 'text-muted-foreground text-xs',
//     },
//     {
//       header: 'Período',
//       accessor: (row: Recurrence) => (
//         <span className="text-xs text-muted-foreground">
//           {formatDate(row.data_inicio)} - {formatDate(row.data_fim)}
//         </span>
//       ),
//       className: 'hidden md:table-cell',
//     },
//     {
//       header: 'Ações',
//       accessor: (row: Recurrence) => (
//         <div className="flex gap-2">
//           <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(row)}>
//             <Pencil className="h-4 w-4" />
//           </Button>
//           <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
//             <Trash2 className="h-4 w-4 text-red-600" />
//           </Button>
//         </div>
//       ),
//     },
//   ]

//   return (
//     <div className="flex min-h-screen overflow-x-hidden">
//       <Sidebar />
//       <FeedbackWidget />
//       <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
//         <div className="flex justify-between items-center mb-6">
//           <PageHeader
//             title="Recorrências"
//             description="Gerencie suas transações recorrentes"
//           />
//           <Button onClick={() => handleOpenDialog()}>
//             <Plus className="mr-2 h-4 w-4" />
//             Nova Recorrência
//           </Button>
//         </div>

//         {loading ? (
//           <Card className="p-8 text-center">
//             <p className="text-muted-foreground">Carregando...</p>
//           </Card>
//         ) : (
//           <DataTable data={recurrences} columns={columns} />
//         )}
//       </main>

//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>{editingRecurrence ? 'Editar' : 'Nova'} Recorrência</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label>Descrição</Label>
//               <Input
//                 value={formData.obs}
//                 onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label>Valor</Label>
//               <Input
//                 type="number"
//                 value={formData.valor}
//                 onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label>Conta</Label>
//               <select
//                 value={formData.conta}
//                 onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
//                 className="w-full px-3 py-2 rounded-md border border-border bg-card"
//               >
//                 <option value="">Selecione</option>
//                 {accounts.map((acc) => (
//                   <option key={acc.id} value={acc.id}>
//                     {acc.nome}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <Label>Categoria</Label>
//               <select
//                 value={formData.categoria}
//                 onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
//                 className="w-full px-3 py-2 rounded-md border border-border bg-card"
//               >
//                 <option value="">Selecione</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.nome}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <Label>Data Vencimento</Label>
//               <Input
//                 type="date"
//                 value={formData.data_vencimento}
//                 onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label>Data Início</Label>
//               <Input
//                 type="date"
//                 value={formData.data_inicio}
//                 onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label>Data Fim</Label>
//               <Input
//                 type="date"
//                 value={formData.data_fim}
//                 onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
//               />
//             </div>
//             <div className="flex gap-2 justify-end">
//               <Button variant="outline" onClick={() => setDialogOpen(false)}>
//                 Cancelar
//               </Button>
//               <Button onClick={handleSave}>Salvar</Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

export default function MetasPage() {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <FeedbackWidget />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full overflow-x-hidden">
        <PageHeader
          title="Recorrências"
          description="Crie transações automaticamente com um periodo definido"
        />

        <Card className="p-12 sm:p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
          <Target className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Em Breve
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md">
            Estamos trabalhando nesta funcionalidade. Em breve você poderá criar transações recorrentes em nosso app.
          </p>
        </Card>
      </main>
    </div>
  )
}
