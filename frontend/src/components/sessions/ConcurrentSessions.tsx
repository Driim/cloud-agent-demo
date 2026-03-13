import { Card, Flex, ProgressBar, Text, Title } from '@tremor/react'
import type { QuotaItem } from '../../types/api'

interface ConcurrentSessionsProps {
  readonly data: readonly QuotaItem[]
}

function ConcurrentSessions({ data }: ConcurrentSessionsProps) {
  const quota = data.find((q) => q.name === 'Concurrent agents')

  if (!quota) {
    return null
  }

  const pct = (quota.used / quota.limit) * 100
  const color = pct >= 90 ? 'red' : pct >= 75 ? 'amber' : 'emerald'

  return (
    <Card>
      <Title>Concurrent Sessions</Title>
      <Flex className="mt-4">
        <Text>{quota.used} active</Text>
        <Text>{quota.limit} max</Text>
      </Flex>
      <ProgressBar value={pct} color={color} className="mt-2" />
    </Card>
  )
}

export default ConcurrentSessions
