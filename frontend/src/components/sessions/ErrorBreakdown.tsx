import { BarChart, Card, Title } from '@tremor/react'
import type { ErrorDistributionResponse } from '../../types/api'

interface ErrorBreakdownProps {
  readonly data: ErrorDistributionResponse
}

function ErrorBreakdown({ data }: ErrorBreakdownProps) {
  const chartData = data.items.map((item) => ({
    type: item.error_type,
    Count: item.count,
  }))

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Error Breakdown</Title>
      <BarChart
        className="mt-4 h-64"
        data={chartData}
        index="type"
        categories={['Count']}
        colors={['red']}
        yAxisWidth={40}
        showAnimation
      />
    </Card>
  )
}

export default ErrorBreakdown
