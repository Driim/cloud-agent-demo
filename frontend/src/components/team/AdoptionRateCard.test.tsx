import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdoptionRateCard from './AdoptionRateCard'
import type { AdoptionRateResponse } from '../../types/api'

const mockData: AdoptionRateResponse = {
  rate_7d: 73.0,
  rate_30d: 100.0,
  total_members: 15,
  active_7d: 11,
  active_30d: 15,
  delta_7d_pct: 10.0,
}

describe('AdoptionRateCard', () => {
  it('renders the adoption rate and title', () => {
    render(<AdoptionRateCard data={mockData} />)
    expect(screen.getByText('Adoption Rate (7d)')).toBeInTheDocument()
    expect(screen.getByText('73%')).toBeInTheDocument()
  })

  it('renders 30-day member count', () => {
    render(<AdoptionRateCard data={mockData} />)
    expect(screen.getByText(/members active in 30 days/)).toBeInTheDocument()
    expect(screen.getByText('15/15')).toBeInTheDocument()
  })

  it('renders the delta badge', () => {
    render(<AdoptionRateCard data={mockData} />)
    expect(screen.getByText('+10%')).toBeInTheDocument()
  })
})
