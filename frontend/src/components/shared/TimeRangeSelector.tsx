import type { TimeSeriesRange } from '../../types/api'

const RANGES: readonly { readonly value: TimeSeriesRange; readonly label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

interface TimeRangeSelectorProps {
  readonly value: TimeSeriesRange
  readonly onChange: (range: TimeSeriesRange) => void
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-surface">
      {RANGES.map(({ value: rangeValue, label }) => (
        <button
          key={rangeValue}
          type="button"
          onClick={() => onChange(rangeValue)}
          className={[
            'px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg',
            value === rangeValue
              ? 'bg-ai-blue text-white'
              : 'text-neutral-400 hover:bg-white/5 hover:text-white',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
