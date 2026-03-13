import { Callout } from '@tremor/react'
import type { QuotaItem } from '../../types/api'

interface BudgetAlertsProps {
  readonly quotas: readonly QuotaItem[]
}

function BudgetAlerts({ quotas }: BudgetAlertsProps) {
  const alerts = quotas
    .map((q) => ({ ...q, pct: q.limit > 0 ? (q.used / q.limit) * 100 : 0 }))
    .filter((q) => q.pct >= 75)

  if (alerts.length === 0) return null

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const color = alert.pct >= 100 ? 'red' : alert.pct >= 90 ? 'rose' : 'amber'
        const title =
          alert.pct >= 100
            ? `${alert.name}: Limit reached`
            : `${alert.name}: ${alert.pct.toFixed(0)}% consumed`
        return (
          <Callout key={alert.name} title={title} color={color}>
            {alert.used.toLocaleString()} of {alert.limit.toLocaleString()} {alert.unit} used.
          </Callout>
        )
      })}
    </div>
  )
}

export default BudgetAlerts
