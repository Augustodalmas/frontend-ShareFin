import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="w-full sm:w-auto">{action}</div>}
      </div>
    </div>
  )
}
