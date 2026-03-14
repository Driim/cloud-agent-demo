import type { CustomTooltipProps } from '@tremor/react'

interface ChartTooltipExtendedProps extends CustomTooltipProps {
  readonly valueFormatter?: (value: number) => string
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  indigo: 'bg-indigo-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  teal: 'bg-teal-500',
}

function ChartTooltip({ active, payload, label, valueFormatter }: ChartTooltipExtendedProps) {
  if (!active || !payload || payload.length === 0) return null

  const formatValue = valueFormatter ?? ((v: number) => v.toLocaleString())

  return (
    <div
      data-testid="chart-tooltip"
      className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm shadow-lg"
    >
      <p className="mb-2 font-medium text-neutral-200">{String(label ?? '')}</p>
      <div className="space-y-1.5">
        {payload.map((item) => {
          const category = String(
            (item as Record<string, unknown>).category ?? item.name ?? '',
          )
          const value = Number(item.value ?? 0)
          const color = String(
            (item as Record<string, unknown>).color ?? '',
          )

          return (
            <div key={category} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorMap[color] ?? 'bg-gray-500'}`}
                />
                <span className="whitespace-nowrap text-neutral-400">{category}</span>
              </div>
              <span className="whitespace-nowrap font-medium tabular-nums text-neutral-100">
                {formatValue(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChartTooltip
