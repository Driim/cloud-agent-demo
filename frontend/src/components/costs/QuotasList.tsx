import { Card, Flex, ProgressBar, Text, Title } from '@tremor/react'
import type { QuotaItem } from '../../types/api'

interface QuotasListProps {
  readonly data: readonly QuotaItem[]
}

function QuotasList({ data }: QuotasListProps) {
  return (
    <Card>
      <Title>Usage Quotas</Title>
      <div className="mt-4 space-y-4">
        {data.map((quota) => {
          const rawPct = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 0
          const pct = Math.min(rawPct, 100)
          const color = rawPct >= 90 ? 'red' : rawPct >= 75 ? 'amber' : 'indigo'
          return (
            <div key={quota.name}>
              <Flex>
                <Text>{quota.name}</Text>
                <Text>
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
