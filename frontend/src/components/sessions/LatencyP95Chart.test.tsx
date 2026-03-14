import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LatencyP95Chart from './LatencyP95Chart'
import type { TimeSeriesResponse } from '../../types/api'

const mockData: TimeSeriesResponse = {
  metric: 'latency_p95',
  range: '30d',
  granularity: 'day',
  points: [
    { timestamp: '2026-03-10', value: 9_500 },
    { timestamp: '2026-03-11', value: 10_200 },
  ],
}

describe('LatencyP95Chart', () => {
  it('renders the title', () => {
    render(<LatencyP95Chart data={mockData} />)
    expect(screen.getByText('P95 Latency Trend')).toBeInTheDocument()
  })
})
