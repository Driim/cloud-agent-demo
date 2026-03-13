import { Card, DonutChart, Title } from '@tremor/react'
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
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Session Outcomes</Title>
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
