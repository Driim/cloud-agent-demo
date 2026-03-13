import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CostTrendChart from './CostTrendChart'
import type { TimeSeriesResponse } from '../../types/api'

const mockData: TimeSeriesResponse = {
  metric: 'cost_per_session',
  range: '30d',
  granularity: 'day',
  points: [
    { timestamp: '2026-03-10', value: 1.85 },
    { timestamp: '2026-03-11', value: 1.92 },
  ],
}

describe('CostTrendChart', () => {
  it('renders the title "Cost per Session"', () => {
    render(<CostTrendChart data={mockData} />)
    expect(screen.getByText('Cost per Session')).toBeInTheDocument()
  })
})
