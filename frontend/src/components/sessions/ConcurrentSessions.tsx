import { Flex, ProgressBar, Text, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { QuotaItem } from '../../types/api'

const CONCURRENT_AGENTS_QUOTA_NAME = 'Concurrent agents'

interface ConcurrentSessionsProps {
  readonly data: readonly QuotaItem[]
}

function ConcurrentSessions({ data }: ConcurrentSessionsProps) {
  const quota = data.find((q) => q.name === CONCURRENT_AGENTS_QUOTA_NAME)

  if (!quota) {
    return null
  }

  const pct = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 0
  const color = pct >= 90 ? 'red' : pct >= 75 ? 'amber' : 'emerald'

  return (
    <DashboardCard>
      <Title className="text-white">Concurrent Sessions</Title>
      <Flex className="mt-4">
        <Text className="text-neutral-300">{quota.used} active</Text>
        <Text className="text-neutral-400">{quota.limit} max</Text>
      </Flex>
      <ProgressBar value={pct} color={color} className="mt-2" />
    </DashboardCard>
  )
}

export default ConcurrentSessions
