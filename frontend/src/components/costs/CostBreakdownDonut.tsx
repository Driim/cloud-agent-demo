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
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Cost Breakdown</Title>
      <DonutChart
        className="mt-4 h-72"
        data={chartData}
        category="value"
        index="name"
        colors={['blue', 'violet', 'amber', 'emerald']}
        valueFormatter={(n: number) => `$${n.toFixed(2)}`}
        showAnimation
      />
    </Card>
  )
}

export default CostBreakdownDonut
