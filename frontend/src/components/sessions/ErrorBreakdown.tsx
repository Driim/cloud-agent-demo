import { BarChart, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import ChartTooltip from '../shared/ChartTooltip'
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
    <DashboardCard>
      <Title className="text-white">Error Breakdown</Title>
      <BarChart
        className="mt-4 h-64"
        data={chartData}
        index="type"
        categories={['Count']}
        colors={['red']}
        yAxisWidth={40}
        showAnimation
        customTooltip={(props) => <ChartTooltip {...props} />}
      />
    </DashboardCard>
  )
}

export default ErrorBreakdown
