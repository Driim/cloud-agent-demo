import { BadgeDelta, Flex, Metric, Text } from '@tremor/react'
import DashboardCard from './DashboardCard'

interface KPICardProps {
  readonly title: string
  readonly value: string
  readonly delta?: string
  readonly deltaType?: 'increase' | 'moderateIncrease' | 'unchanged' | 'moderateDecrease' | 'decrease'
}

function KPICard({ title, value, delta, deltaType }: KPICardProps) {
  return (
    <DashboardCard>
      <Text className="text-neutral-400">{title}</Text>
      <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
        <Metric className="text-white font-mono">{value}</Metric>
        {delta && deltaType && (
          <BadgeDelta deltaType={deltaType} size="xs">
            {delta}
          </BadgeDelta>
        )}
      </Flex>
    </DashboardCard>
  )
}

export default KPICard
