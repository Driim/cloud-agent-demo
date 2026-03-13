import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DurationDistribution from './DurationDistribution'
import type { DurationBucket } from '../../types/api'

const mockData: readonly DurationBucket[] = [
  { bucket: '< 1 min', count: 5 },
  { bucket: '1–5 min', count: 28 },
  { bucket: '5–15 min', count: 31 },
  { bucket: '15+ min', count: 16 },
]

describe('DurationDistribution', () => {
  it('renders the title', () => {
    render(<DurationDistribution data={mockData} />)
    expect(screen.getByText('Duration Distribution')).toBeInTheDocument()
  })
})
