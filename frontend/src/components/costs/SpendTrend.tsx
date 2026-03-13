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
    <Card>
      <Title>Daily Spend Trend</Title>
      <LineChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['Spend']}
        colors={['indigo']}
        valueFormatter={(n: number) => `$${n.toFixed(2)}`}
        showAnimation
      />
    </Card>
  )
}

export default SpendTrend
