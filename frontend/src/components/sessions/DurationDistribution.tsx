import { BarChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
import type { DurationBucket } from '../../types/api'

interface DurationDistributionProps {
  readonly data: readonly DurationBucket[]
}

function DurationDistribution({ data }: DurationDistributionProps) {
  const chartData = data.map((b) => ({
    bucket: b.bucket,
    Sessions: b.count,
  }))

  return (
    <DashboardCard>
      <Title className="text-white">Duration Distribution</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="bucket"
        categories={['Sessions']}
        colors={['blue']}
        valueFormatter={(n: number) => n.toString()}
        yAxisWidth={40}
        showAnimation
        customTooltip={(props) => (
          <ChartTooltip {...props} valueFormatter={(n: number) => n.toString()} />
        )}
      />
    </DashboardCard>
  )
}

export default DurationDistribution
