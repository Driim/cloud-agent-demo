import { LineChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
import type { TimeSeriesResponse } from '../../types/api'
import { formatChartDate } from '../../utils/format'

interface LatencyP95ChartProps {
  readonly data: TimeSeriesResponse
}

function LatencyP95Chart({ data }: LatencyP95ChartProps) {
  const chartData = data.points.map((p) => ({
    date: formatChartDate(p.timestamp),
    'P95 (s)': +(p.value / 1000).toFixed(1),
  }))

  const formatLatency = (n: number) => `${n.toFixed(1)}s`

  return (
    <DashboardCard>
      <Title className="text-white">P95 Latency Trend</Title>
      <LineChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['P95 (s)']}
        colors={['violet']}
        valueFormatter={formatLatency}
        yAxisWidth={56}
        showAnimation
        customTooltip={(props) => (
          <ChartTooltip {...props} valueFormatter={formatLatency} />
        )}
      />
    </DashboardCard>
  )
}

export default LatencyP95Chart
