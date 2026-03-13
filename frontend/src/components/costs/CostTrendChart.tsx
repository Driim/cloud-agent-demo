import { Card, LineChart, Title } from '@tremor/react'
import type { TimeSeriesResponse } from '../../types/api'
import { formatChartDate } from '../../utils/format'

interface CostTrendChartProps {
  readonly data: TimeSeriesResponse
}

function CostTrendChart({ data }: CostTrendChartProps) {
  const chartData = data.points.map((p) => ({
    date: formatChartDate(p.timestamp),
    'Cost per Session': p.value,
  }))

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Cost per Session</Title>
      <LineChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['Cost per Session']}
        colors={['violet']}
        valueFormatter={(n: number) => `$${n.toFixed(2)}`}
        yAxisWidth={56}
        showAnimation
      />
    </Card>
  )
}

export default CostTrendChart
