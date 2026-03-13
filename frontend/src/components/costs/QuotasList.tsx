import { Flex, ProgressBar, Text, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { QuotaItem } from '../../types/api'

interface QuotasListProps {
  readonly data: readonly QuotaItem[]
}

function QuotasList({ data }: QuotasListProps) {
  return (
    <DashboardCard>
      <Title className="text-white">Usage Quotas</Title>
      <div className="mt-4 space-y-4">
        {data.map((quota) => {
          const rawPct = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 0
          const pct = Math.min(rawPct, 100)
          const color = rawPct >= 90 ? 'red' : rawPct >= 75 ? 'amber' : 'blue'
          return (
            <div key={quota.name}>
              <Flex>
                <Text className="text-neutral-400">{quota.name}</Text>
                <Text className="text-neutral-300">
                  {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} {quota.unit}
                </Text>
              </Flex>
              <ProgressBar value={pct} color={color} className="mt-1" />
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}

export default QuotasList
