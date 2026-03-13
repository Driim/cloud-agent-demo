import { BarChart, Card, Title } from '@tremor/react'
import type { RepoActivity } from '../../types/api'

interface TopReposBarProps {
  readonly data: readonly RepoActivity[]
}

function TopReposBar({ data }: TopReposBarProps) {
  const chartData = data.map((r) => ({
    repo: r.repo,
    Sessions: r.sessions,
  }))

  return (
    <Card>
      <Title>Top Repositories</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="repo"
        categories={['Sessions']}
        colors={['indigo']}
        layout="vertical"
        showAnimation
      />
    </Card>
  )
}

export default TopReposBar
