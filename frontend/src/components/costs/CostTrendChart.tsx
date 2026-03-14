import { LineChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
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
    <DashboardCard>
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
        customTooltip={(props) => (
          <ChartTooltip {...props} valueFormatter={(n: number) => `$${n.toFixed(2)}`} />
        )}
      />
    </DashboardCard>
  )
}

export default CostTrendChart
