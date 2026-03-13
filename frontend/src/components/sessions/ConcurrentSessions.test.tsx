import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConcurrentSessions from './ConcurrentSessions'
import type { QuotaItem } from '../../types/api'

const mockQuotas: readonly QuotaItem[] = [
  { name: 'Sessions', used: 2188, limit: 5000, unit: 'sessions/month' },
  { name: 'Concurrent agents', used: 6, limit: 15, unit: 'agents' },
]

describe('ConcurrentSessions', () => {
  it('renders title and quota values', () => {
    render(<ConcurrentSessions data={mockQuotas} />)
    expect(screen.getByText('Concurrent Sessions')).toBeInTheDocument()
    expect(screen.getByText('6 active')).toBeInTheDocument()
    expect(screen.getByText('15 max')).toBeInTheDocument()
  })

  it('renders nothing when quota is missing', () => {
    const noAgents: readonly QuotaItem[] = [
      { name: 'Sessions', used: 100, limit: 500, unit: 'sessions/month' },
    ]
    const { container } = render(<ConcurrentSessions data={noAgents} />)
    expect(container.firstChild).toBeNull()
  })
})
