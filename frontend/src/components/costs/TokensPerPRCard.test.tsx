import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TokensPerPRCard from './TokensPerPRCard'
import type { TokensPerPRResponse } from '../../types/api'

const mockData: TokensPerPRResponse = {
  avg_tokens_per_pr: 53_810,
  delta_pct: -4.2,
}

describe('TokensPerPRCard', () => {
  it('renders title and formatted value', () => {
    render(<TokensPerPRCard data={mockData} />)
    expect(screen.getByText('Tokens per Merged PR')).toBeInTheDocument()
    expect(screen.getByText('53,810')).toBeInTheDocument()
  })

  it('renders the delta badge', () => {
    render(<TokensPerPRCard data={mockData} />)
    expect(screen.getByText('-4.2%')).toBeInTheDocument()
  })
})
