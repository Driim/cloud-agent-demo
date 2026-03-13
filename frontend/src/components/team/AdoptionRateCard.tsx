import { Card, Flex, Metric, Text, BadgeDelta } from '@tremor/react'
import type { AdoptionRateResponse } from '../../types/api'

interface AdoptionRateCardProps {
  readonly data: AdoptionRateResponse
}

function AdoptionRateCard({ data }: AdoptionRateCardProps) {
  return (
    <Card>
      <Text>Adoption Rate (7d)</Text>
      <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
        <Metric>{data.rate_7d}%</Metric>
        <BadgeDelta
          deltaType={data.delta_7d_pct >= 0 ? 'moderateIncrease' : 'moderateDecrease'}
          size="xs"
        >
          {data.delta_7d_pct >= 0 ? '+' : ''}{data.delta_7d_pct}%
        </BadgeDelta>
      </Flex>
      <Text className="mt-2">
        {data.active_30d}/{data.total_members} members active in 30 days
      </Text>
    </Card>
  )
}

export default AdoptionRateCard
