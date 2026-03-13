import { Card, LineChart, Title } from '@tremor/react'
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
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
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
    </Card>
  )
}

export default LatencyP95Chart
