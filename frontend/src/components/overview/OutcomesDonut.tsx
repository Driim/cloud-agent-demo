import { Card, DonutChart, Title } from '@tremor/react'
import type { ErrorDistributionResponse } from '../../types/api'

interface OutcomesDonutProps {
  readonly data: ErrorDistributionResponse
}

function OutcomesDonut({ data }: OutcomesDonutProps) {
  const chartData = data.items.map((item) => ({
    name: item.error_type,
    value: item.count,
  }))

  return (
    <Card>
      <Title>Error Distribution</Title>
      <DonutChart
        className="mt-4 h-72"
        data={chartData}
        category="value"
        index="name"
        colors={['emerald', 'blue', 'red', 'amber']}
        valueFormatter={(n: number) => n.toString()}
        showAnimation
      />
    </Card>
  )
}

export default OutcomesDonut
