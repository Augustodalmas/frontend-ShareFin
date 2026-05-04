'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, X } from 'lucide-react'

interface MobileFiltersProps {
  children: React.ReactNode
  hasActiveFilters?: boolean
  onClearFilters?: () => void
}

export function MobileFilters({ children, hasActiveFilters, onClearFilters }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden mb-4">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Filtros {hasActiveFilters && '(ativos)'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="mt-3 p-4 rounded-lg border border-border bg-card space-y-3">
          {children}
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
