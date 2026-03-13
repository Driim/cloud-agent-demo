import { DonutChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
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
    <DashboardCard>
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
    </DashboardCard>
  )
}

export default CostBreakdownDonut
