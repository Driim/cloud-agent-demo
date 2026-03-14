import { DonutChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
import type { SessionOutcomesResponse } from '../../types/api'

interface OutcomesDonutProps {
  readonly data: SessionOutcomesResponse
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  merged: 'Merged',
  failed: 'Failed',
  timed_out: 'Timed Out',
}

function OutcomesDonut({ data }: OutcomesDonutProps) {
  const chartData = data.items.map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    value: item.count,
  }))

  return (
    <DashboardCard>
      <Title className="text-white">Session Outcomes</Title>
      <DonutChart
        className="mt-4 h-72"
        data={chartData}
        category="value"
        index="name"
        colors={['emerald', 'blue', 'red', 'amber']}
        valueFormatter={(n: number) => n.toString()}
        showAnimation
        customTooltip={(props) => (
          <ChartTooltip {...props} valueFormatter={(n: number) => n.toString()} />
        )}
      />
    </DashboardCard>
  )
}

export default OutcomesDonut
