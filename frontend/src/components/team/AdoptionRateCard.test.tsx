import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdoptionRateCard from './AdoptionRateCard'
import type { AdoptionRateResponse } from '../../types/api'

const mockData: AdoptionRateResponse = {
  rate_7d: 75.0,
  rate_30d: 100.0,
  total_members: 8,
  active_7d: 6,
  active_30d: 8,
  delta_7d_pct: 12.5,
}

describe('AdoptionRateCard', () => {
  it('renders the adoption rate and title', () => {
    render(<AdoptionRateCard data={mockData} />)
    expect(screen.getByText('Adoption Rate (7d)')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders 30-day member count', () => {
    render(<AdoptionRateCard data={mockData} />)
    expect(screen.getByText('8/8 members active in 30 days')).toBeInTheDocument()
  })

  it('renders the delta badge', () => {
    render(<AdoptionRateCard data={mockData} />)
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })
})
