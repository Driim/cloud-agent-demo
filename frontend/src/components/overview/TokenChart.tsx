import { Card, Title, AreaChart } from '@tremor/react'
import type { TimeSeriesResponse } from '../../types/api'
import { formatChartDate } from '../../utils/format'

interface TokenChartProps {
  readonly data: TimeSeriesResponse
}

function TokenChart({ data }: TokenChartProps) {
  const chartData = data.points.map((p) => ({
    date: formatChartDate(p.timestamp),
    Tokens: p.value,
  }))

  return (
    <Card>
      <Title>Token Consumption</Title>
      <AreaChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['Tokens']}
        colors={['indigo']}
        valueFormatter={(n: number) =>
          n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toString()
        }
        showAnimation
      />
    </Card>
  )
}

export default TokenChart
