import { Card, DonutChart, Title } from '@tremor/react'
import type { CostLineItem } from '../../types/api'

interface CostBreakdownDonutProps {
  readonly data: readonly CostLineItem[]
}

function CostBreakdownDonut({ data }: CostBreakdownDonutProps) {
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount_usd,
  }))

  return (
    <Card>
      <Title>Cost Breakdown</Title>
      <DonutChart
        className="mt-4 h-72"
        data={chartData}
        category="value"
        index="name"
        colors={['indigo', 'cyan', 'amber', 'emerald']}
        valueFormatter={(n: number) => `$${n.toFixed(2)}`}
        showAnimation
      />
    </Card>
  )
}

export default CostBreakdownDonut
