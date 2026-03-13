import { Flex, Metric, Text, BadgeDelta } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { AdoptionRateResponse } from '../../types/api'

interface AdoptionRateCardProps {
  readonly data: AdoptionRateResponse
}

function AdoptionRateCard({ data }: AdoptionRateCardProps) {
  return (
    <DashboardCard>
      <Text className="text-neutral-400">Adoption Rate (7d)</Text>
      <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
        <Metric className="text-white font-mono">{data.rate_7d}%</Metric>
        <BadgeDelta
          deltaType={data.delta_7d_pct >= 0 ? 'moderateIncrease' : 'moderateDecrease'}
          size="xs"
        >
          {data.delta_7d_pct >= 0 ? '+' : ''}{data.delta_7d_pct}%
        </BadgeDelta>
      </Flex>
      <Text className="mt-2 text-neutral-400">
        {data.active_30d}/{data.total_members} members active in 30 days
      </Text>
    </DashboardCard>
  )
}

export default AdoptionRateCard
