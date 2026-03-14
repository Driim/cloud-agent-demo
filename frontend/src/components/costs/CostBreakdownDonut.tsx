import { DonutChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
import type { CostLineItem } from '../../types/api'
import { formatUSD } from '../../utils/format'

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
        colors={['violet', 'orange', 'sky', 'emerald']}
        valueFormatter={formatUSD}
        showAnimation
        customTooltip={(props) => (
          <ChartTooltip {...props} valueFormatter={formatUSD} />
        )}
      />
    </DashboardCard>
  )
}

export default CostBreakdownDonut
