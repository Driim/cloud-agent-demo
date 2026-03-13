import { Title, AreaChart } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import type { MultiSeriesResponse } from '../../types/api'
import { formatChartDate } from '../../utils/format'

interface TokenChartProps {
  readonly data: MultiSeriesResponse
}

function TokenChart({ data }: TokenChartProps) {
  const chartData = data.points.map((p) => ({
    date: formatChartDate(p.timestamp),
    'Input Tokens': p.input_tokens,
    'Output Tokens': p.output_tokens,
  }))

  return (
    <DashboardCard>
      <Title className="text-white">Token Consumption</Title>
      <AreaChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['Input Tokens', 'Output Tokens']}
        colors={['blue', 'violet']}
        stack
        valueFormatter={(n: number) =>
          n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toString()
        }
        yAxisWidth={56}
        showAnimation
      />
    </DashboardCard>
  )
}

export default TokenChart
