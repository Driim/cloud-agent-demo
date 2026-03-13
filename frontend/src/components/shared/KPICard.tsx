import { BadgeDelta, Card, Flex, Metric, Text } from '@tremor/react'

interface KPICardProps {
  readonly title: string
  readonly value: string
  readonly delta?: string
  readonly deltaType?: 'increase' | 'moderateIncrease' | 'unchanged' | 'moderateDecrease' | 'decrease'
}

function KPICard({ title, value, delta, deltaType }: KPICardProps) {
  return (
    <Card>
      <Text>{title}</Text>
      <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
        <Metric>{value}</Metric>
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
