'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Building2, Tag, Receipt, Share2, LogOut, Menu, X, Target, Sparkles, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authAPI, isAdmin } from '@/lib/api'
import { useState, useEffect } from 'react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/usuarios',
    icon: Users,
  },
  {
    title: 'Contas Bancárias',
    href: '/contas',
    icon: Building2,
  },
  {
    title: 'Compartilhadas',
    href: '/compartilhadas',
    icon: Share2,
  },
  {
    title: 'Categorias',
    href: '/categorias',
    icon: Tag,
  },
  {
    title: 'Transações',
    href: '/transacoes',
    icon: Receipt,
  },
  // {
  //   title: 'Recorrências',
  //   href: '/recorrencias',
  //   icon: Repeat,
  // },
  // {
  //   title: 'Metas',
  //   href: '/metas',
  //   icon: Target,
  // },
  // {
  //   title: 'Assistente IA',
  //   href: '/assistente',
  //   icon: Sparkles,
  // },
  {
    title: 'Perfil',
    href: '/perfil',
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    setUserIsAdmin(isAdmin())
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLogout = () => {
    authAPI.logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-card p-2 border border-border shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 border-r border-border bg-card flex flex-col z-40 transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6 gap-3">
          <img src="/logo-sharefin-bg.png" alt="ShareFin Logo" className="h-10 w-10" />
          <h1 className="text-lg lg:text-xl font-semibold text-foreground">
            ShareFin <span className="text-xs text-muted-foreground font-normal">v0.0.1</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.href === '/usuarios' && !userIsAdmin) return null

            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm lg:text-base font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm lg:text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm lg:text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
