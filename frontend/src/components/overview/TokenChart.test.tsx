import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TokenChart from './TokenChart'
import type { MultiSeriesResponse } from '../../types/api'

const mockData: MultiSeriesResponse = {
  metric: 'token_breakdown',
  range: '7d',
  granularity: 'day',
  points: [
    { timestamp: '2026-03-06', input_tokens: 300_000, output_tokens: 200_000 },
    { timestamp: '2026-03-07', input_tokens: 310_000, output_tokens: 210_000 },
  ],
}

describe('TokenChart', () => {
  it('renders the title', () => {
    render(<TokenChart data={mockData} />)
    expect(screen.getByText('Token Consumption')).toBeInTheDocument()
  })
})
