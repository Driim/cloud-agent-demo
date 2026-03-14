import { Badge, Flex, Text, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { QuotaItem } from '../../types/api'

interface QuotasListProps {
  readonly data: readonly QuotaItem[]
}

type QuotaStatus = 'Normal' | 'Warning' | 'Critical'

const FILL_COLOR: Record<QuotaStatus, string> = {
  Normal: '#3b82f6',
  Warning: '#f59e0b',
  Critical: '#ef4444',
}

const BADGE_COLOR: Record<QuotaStatus, 'blue' | 'amber' | 'red'> = {
  Normal: 'blue',
  Warning: 'amber',
  Critical: 'red',
}

function getStatus(rawPct: number): QuotaStatus {
  if (rawPct >= 90) return 'Critical'
  if (rawPct >= 75) return 'Warning'
  return 'Normal'
}

const COMPACT_FORMAT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

function QuotasList({ data }: QuotasListProps) {
  return (
    <DashboardCard>
      <Title className="text-white">Usage Quotas</Title>
      <div className="mt-4 space-y-5">
        {data.map((quota) => {
          const rawPct = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 0
          const pct = Math.min(rawPct, 100)
          const status = getStatus(rawPct)
          const remaining = quota.limit - quota.used

          return (
            <div key={quota.name}>
              <Flex className="mb-1">
                <Text className="text-neutral-300 font-medium">{quota.name}</Text>
                <Badge color={BADGE_COLOR[status]} size="xs">{status}</Badge>
              </Flex>
              <div className="flex items-center gap-2 mb-1">
                <div className="relative flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: FILL_COLOR[status] }}
                    data-testid={`quota-bar-${quota.name}`}
                  />
                </div>
                <span
                  className="text-neutral-400 text-xs tabular-nums w-9 text-right"
                  data-testid={`quota-pct-${quota.name}`}
                >
                  {Math.round(rawPct)}%
                </span>
              </div>
              <Flex>
                <Text className="text-neutral-500 text-xs">
                  {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} {quota.unit}
                </Text>
                {remaining > 0 && (
                  <span
                    className="text-neutral-500 text-xs"
                    data-testid={`quota-remaining-${quota.name}`}
                  >
                    {COMPACT_FORMAT.format(remaining)} remaining
                  </span>
                )}
              </Flex>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}

export default QuotasList
