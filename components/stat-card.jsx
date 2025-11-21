import { Card } from '@/components/ui/card'

export function StatCard({ title, value, icon: Icon, description }) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground truncate">{value}</p>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2 sm:p-3 flex-shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}
