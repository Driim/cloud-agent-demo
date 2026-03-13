import { BarChart, Card, Title } from '@tremor/react'
import type { CostTrend } from '../../types/api'

interface CostTrendChartProps {
  readonly data: readonly CostTrend[]
}

function CostTrendChart({ data }: CostTrendChartProps) {
  const chartData = data.map((t) => ({
    month: t.month,
    Spend: t.amount_usd,
  }))

  return (
    <Card>
      <Title>Monthly Cost Trend</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="month"
        categories={['Spend']}
        colors={['indigo']}
        valueFormatter={(n: number) => `$${n.toFixed(0)}`}
        showAnimation
      />
    </Card>
  )
}

export default CostTrendChart
