import { BadgeDelta, Flex, Metric, SparkAreaChart, Text } from '@tremor/react'
import DashboardCard from './DashboardCard'

interface KPICardProps {
  readonly title: string
  readonly value: string
  readonly delta?: string
  readonly deltaType?: 'increase' | 'moderateIncrease' | 'unchanged' | 'moderateDecrease' | 'decrease'
  readonly trendData?: readonly number[]
}

function KPICard({ title, value, delta, deltaType, trendData }: KPICardProps) {
  const sparkData = trendData?.map((v, i) => ({ i, v }))

  return (
    <DashboardCard>
      <Flex alignItems="start">
        <div className="flex-1 min-w-0">
          <Text className="text-neutral-400">{title}</Text>
          <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
            <Metric className="text-white font-mono">{value}</Metric>
            {delta && deltaType && (
              <BadgeDelta deltaType={deltaType} size="xs">
                {delta}
              </BadgeDelta>
            )}
          </Flex>
        </div>
        {sparkData && sparkData.length > 0 && (
          <SparkAreaChart
            data={sparkData}
            categories={['v']}
            index="i"
            colors={['blue']}
            className="h-10 w-24 shrink-0"
          />
        )}
      </Flex>
    </DashboardCard>
  )
}

export default KPICard
