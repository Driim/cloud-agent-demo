import { LineChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { TimeSeriesResponse } from '../../types/api'
import { formatChartDate } from '../../utils/format'

interface LatencyP95ChartProps {
  readonly data: TimeSeriesResponse
}

function LatencyP95Chart({ data }: LatencyP95ChartProps) {
  const chartData = data.points.map((p) => ({
    date: formatChartDate(p.timestamp),
    'P95 (ms)': p.value,
  }))

  return (
    <DashboardCard>
      <Title className="text-white">P95 Latency Trend</Title>
      <LineChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['P95 (ms)']}
        colors={['violet']}
        valueFormatter={(n: number) => `${Math.round(n)}ms`}
        yAxisWidth={56}
        showAnimation
      />
    </DashboardCard>
  )
}

export default LatencyP95Chart
