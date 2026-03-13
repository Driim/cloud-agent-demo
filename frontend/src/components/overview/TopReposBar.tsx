import { BarChart, Card, Title } from '@tremor/react'
import type { RepoActivity } from '../../types/api'

interface TopReposBarProps {
  readonly data: readonly RepoActivity[]
}

function TopReposBar({ data }: TopReposBarProps) {
  const chartData = data.map((r) => ({
    repo: r.repo.includes('/') ? r.repo.split('/')[1] : r.repo,
    Sessions: r.sessions,
  }))

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Top Repositories</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="repo"
        categories={['Sessions']}
        colors={['blue']}
        layout="vertical"
        yAxisWidth={100}
        showAnimation
      />
    </Card>
  )
}

export default TopReposBar
