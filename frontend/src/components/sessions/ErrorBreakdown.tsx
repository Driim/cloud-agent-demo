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
    <Card>
      <Title>Error Breakdown</Title>
      <BarChart
        className="mt-4 h-64"
        data={chartData}
        index="type"
        categories={['Count']}
        colors={['red']}
        showAnimation
      />
    </Card>
  )
}

export default ErrorBreakdown
