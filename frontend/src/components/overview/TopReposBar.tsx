import { BarChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
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
    <DashboardCard>
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
        customTooltip={(props) => <ChartTooltip {...props} />}
      />
    </DashboardCard>
  )
}

export default TopReposBar
