import { BarChart, Card, Title } from '@tremor/react'
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
    <Card>
      <Title>Duration Distribution</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="bucket"
        categories={['Sessions']}
        colors={['indigo']}
        valueFormatter={(n: number) => n.toString()}
        yAxisWidth={40}
        showAnimation
      />
    </Card>
  )
}

export default DurationDistribution
