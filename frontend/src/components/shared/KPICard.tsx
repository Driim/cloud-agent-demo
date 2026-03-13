import { BadgeDelta, Card, Flex, Metric, Text } from '@tremor/react'

interface KPICardProps {
  readonly title: string
  readonly value: string
  readonly delta?: string
  readonly deltaType?: 'increase' | 'moderateIncrease' | 'unchanged' | 'moderateDecrease' | 'decrease'
}

function KPICard({ title, value, delta, deltaType }: KPICardProps) {
  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Text className="text-neutral-400">{title}</Text>
      <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
        <Metric className="text-white font-mono">{value}</Metric>
        {delta && deltaType && (
          <BadgeDelta deltaType={deltaType} size="xs">
            {delta}
          </BadgeDelta>
        )}
      </Flex>
    </Card>
  )
}

export default KPICard
