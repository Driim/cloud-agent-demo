import { BarChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { TeamMemberStats } from '../../types/api'

interface SessionsPerMemberProps {
  readonly data: readonly TeamMemberStats[]
}

function SessionsPerMember({ data }: SessionsPerMemberProps) {
  const chartData = data.map((m) => ({
    name: m.display_name,
    Sessions: m.sessions,
  }))

  return (
    <DashboardCard>
      <Title className="text-white">Sessions per Member</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="name"
        categories={['Sessions']}
        colors={['blue']}
        yAxisWidth={40}
        showAnimation
      />
    </DashboardCard>
  )
}

export default SessionsPerMember
