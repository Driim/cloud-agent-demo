import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'
import type { SessionStatus } from '../../types/api'

describe('StatusBadge', () => {
  const cases: Array<[SessionStatus, string]> = [
    ['completed', 'Completed'],
    ['merged', 'Merged'],
    ['failed', 'Failed'],
    ['timed_out', 'Timed Out'],
  ]

  it.each(cases)('renders label "%s" for status %s', (_status, label) => {
    render(<StatusBadge status={_status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('falls back to the raw status string for unknown values', () => {
    // Cast to bypass TS to simulate a future/unknown status from the API
    render(<StatusBadge status={'unknown_status' as SessionStatus} />)
    expect(screen.getByText('unknown_status')).toBeInTheDocument()
  })
})
