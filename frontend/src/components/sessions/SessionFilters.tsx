import { Select, SelectItem } from '@tremor/react'
import type { SessionStatus } from '../../types/api'

interface SessionFiltersProps {
  readonly status: SessionStatus | undefined
  readonly onStatusChange: (status: SessionStatus | undefined) => void
}

const STATUSES: readonly { readonly value: SessionStatus; readonly label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'merged', label: 'Merged' },
  { value: 'failed', label: 'Failed' },
  { value: 'timed_out', label: 'Timed Out' },
]

function SessionFilters({ status, onStatusChange }: SessionFiltersProps) {
  return (
    <div className="flex gap-3">
      <Select
        placeholder="All statuses"
        value={status ?? ''}
        onValueChange={(val) =>
          onStatusChange(val === '' ? undefined : (val as SessionStatus))
        }
        className="w-44"
      >
        <SelectItem value="">All statuses</SelectItem>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

export default SessionFilters
