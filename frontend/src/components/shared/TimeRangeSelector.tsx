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
    <div className="inline-flex rounded-md border border-gray-200 bg-white">
      {RANGES.map(({ value: rangeValue, label }) => (
        <button
          key={rangeValue}
          type="button"
          onClick={() => onChange(rangeValue)}
          className={[
            'px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md',
            value === rangeValue
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
