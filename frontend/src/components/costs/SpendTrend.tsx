import { Card, LineChart, Title } from '@tremor/react'
import type { TimeSeriesResponse } from '../../types/api'
import { formatChartDate } from '../../utils/format'

interface SpendTrendProps {
  readonly data: TimeSeriesResponse
}

function SpendTrend({ data }: SpendTrendProps) {
  const chartData = data.points.map((p) => ({
    date: formatChartDate(p.timestamp),
    Spend: p.value,
  }))

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Daily Spend Trend</Title>
      <LineChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['Spend']}
        colors={['blue']}
        valueFormatter={(n: number) => `$${n.toFixed(2)}`}
        yAxisWidth={56}
        showAnimation
      />
    </Card>
  )
}

export default SpendTrend
