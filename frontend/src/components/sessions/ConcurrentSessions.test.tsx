import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConcurrentSessions from './ConcurrentSessions'
import type { QuotaItem } from '../../types/api'

const mockQuotas: readonly QuotaItem[] = [
  { name: 'Sessions', used: 1050, limit: 1500, unit: 'sessions/month' },
  { name: 'Concurrent agents', used: 4, limit: 10, unit: 'agents' },
]

describe('ConcurrentSessions', () => {
  it('renders title and quota values', () => {
    render(<ConcurrentSessions data={mockQuotas} />)
    expect(screen.getByText('Concurrent Sessions')).toBeInTheDocument()
    expect(screen.getByText('4 active')).toBeInTheDocument()
    expect(screen.getByText('10 max')).toBeInTheDocument()
  })

  it('renders nothing when quota is missing', () => {
    const noAgents: readonly QuotaItem[] = [
      { name: 'Sessions', used: 100, limit: 500, unit: 'sessions/month' },
    ]
    const { container } = render(<ConcurrentSessions data={noAgents} />)
    expect(container.firstChild).toBeNull()
  })

  it('handles limit=0 without division error', () => {
    const zeroLimit: readonly QuotaItem[] = [
      { name: 'Concurrent agents', used: 0, limit: 0, unit: 'agents' },
    ]
    render(<ConcurrentSessions data={zeroLimit} />)
    expect(screen.getByText('0 active')).toBeInTheDocument()
    expect(screen.getByText('0 max')).toBeInTheDocument()
  })
})
