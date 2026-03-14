import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DurationDistribution from './DurationDistribution'
import type { DurationBucket } from '../../types/api'

const mockData: readonly DurationBucket[] = [
  { bucket: '< 10 min', count: 210 },
  { bucket: '10–30 min', count: 420 },
  { bucket: '30–60 min', count: 263 },
  { bucket: '60+ min', count: 157 },
]

describe('DurationDistribution', () => {
  it('renders the title', () => {
    render(<DurationDistribution data={mockData} />)
    expect(screen.getByText('Duration Distribution')).toBeInTheDocument()
  })
})
