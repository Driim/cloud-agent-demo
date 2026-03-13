import { Card, Title, AreaChart } from '@tremor/react'
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
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
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
    </Card>
  )
}

export default TokenChart
