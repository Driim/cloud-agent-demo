import { Card, Flex, ProgressBar, Text, Title } from '@tremor/react'
import type { QuotaItem } from '../../types/api'

interface QuotasListProps {
  readonly data: readonly QuotaItem[]
}

function QuotasList({ data }: QuotasListProps) {
  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
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
    </Card>
  )
}

export default QuotasList
