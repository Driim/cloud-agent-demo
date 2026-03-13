import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OutcomesDonut from './OutcomesDonut'
import type { SessionOutcomesResponse } from '../../types/api'

const mockData: SessionOutcomesResponse = {
  total: 80,
  items: [
    { status: 'completed', count: 27, percentage: 33.75 },
    { status: 'merged', count: 33, percentage: 41.25 },
    { status: 'failed', count: 13, percentage: 16.25 },
    { status: 'timed_out', count: 7, percentage: 8.75 },
  ],
}

describe('OutcomesDonut', () => {
  it('renders the title "Session Outcomes"', () => {
    render(<OutcomesDonut data={mockData} />)
    expect(screen.getByText('Session Outcomes')).toBeInTheDocument()
  })
})
