import { BarChart, Card, Title } from '@tremor/react'
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
    <Card>
      <Title>Sessions per Member</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="name"
        categories={['Sessions']}
        colors={['indigo']}
        showAnimation
      />
    </Card>
  )
}

export default SessionsPerMember
