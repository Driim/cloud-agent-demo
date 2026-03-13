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
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Concurrent Sessions</Title>
      <Flex className="mt-4">
        <Text className="text-neutral-300">{quota.used} active</Text>
        <Text className="text-neutral-400">{quota.limit} max</Text>
      </Flex>
      <ProgressBar value={pct} color={color} className="mt-2" />
    </Card>
  )
}

export default ConcurrentSessions
