import { Badge } from '@tremor/react'
import type { SessionStatus } from '../../types/api'

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string }> = {
  completed: { color: 'emerald', label: 'Completed' },
  merged: { color: 'emerald', label: 'Merged' },
  failed: { color: 'red', label: 'Failed' },
  timed_out: { color: 'amber', label: 'Timed Out' },
  active: { color: 'orange', label: 'Active' },
}

interface StatusBadgeProps {
  readonly status: SessionStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { color: 'gray', label: status }
  return (
    <Badge color={config.color} size="xs">
      {config.label}
    </Badge>
  )
}

export default StatusBadge
