import { Card } from '@tremor/react'
import type { ReactNode } from 'react'

interface DashboardCardProps {
  readonly children: ReactNode
  readonly className?: string
}

function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <Card className={`bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0 ${className ?? ''}`}>
      {children}
    </Card>
  )
}

export default DashboardCard
