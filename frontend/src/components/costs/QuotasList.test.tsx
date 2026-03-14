import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuotasList from './QuotasList'
import type { QuotaItem } from '../../types/api'

const makeQuota = (overrides: Partial<QuotaItem> = {}): QuotaItem => ({
  name: 'Sessions',
  used: 700,
  limit: 1000,
  unit: 'sessions/month',
  ...overrides,
})

describe('QuotasList', () => {
  it('renders the title', () => {
    render(<QuotasList data={[makeQuota()]} />)
    expect(screen.getByText('Usage Quotas')).toBeInTheDocument()
  })

  it('renders quota name', () => {
    render(<QuotasList data={[makeQuota({ name: 'API calls' })]} />)
    expect(screen.getByText('API calls')).toBeInTheDocument()
  })

  it('renders used/limit/unit text', () => {
    render(<QuotasList data={[makeQuota({ used: 700, limit: 1000, unit: 'sessions/month' })]} />)
    expect(screen.getByText('700 / 1,000 sessions/month')).toBeInTheDocument()
  })

  it('shows percentage for each quota', () => {
    render(<QuotasList data={[makeQuota({ used: 700, limit: 1000 })]} />)
    expect(screen.getByTestId('quota-pct-Sessions')).toHaveTextContent('70%')
  })

  it('shows "Normal" badge when usage < 75%', () => {
    render(<QuotasList data={[makeQuota({ used: 500, limit: 1000 })]} />)
    expect(screen.getByText('Normal')).toBeInTheDocument()
  })

  it('shows "Warning" badge when usage is 75–89%', () => {
    render(<QuotasList data={[makeQuota({ used: 800, limit: 1000 })]} />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('shows "Critical" badge when usage >= 90%', () => {
    render(<QuotasList data={[makeQuota({ used: 950, limit: 1000 })]} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('shows remaining amount when remaining > 0', () => {
    render(<QuotasList data={[makeQuota({ used: 700, limit: 1000 })]} />)
    expect(screen.getByTestId('quota-remaining-Sessions')).toHaveTextContent('300 remaining')
  })

  it('hides remaining when quota is fully used', () => {
    render(<QuotasList data={[makeQuota({ used: 1000, limit: 1000 })]} />)
    expect(screen.queryByTestId('quota-remaining-Sessions')).not.toBeInTheDocument()
  })

  it('renders multiple quota items', () => {
    const data: QuotaItem[] = [
      makeQuota({ name: 'Sessions', used: 500, limit: 1000 }),
      makeQuota({ name: 'Tokens', used: 900, limit: 1000, unit: 'tokens/month' }),
    ]
    render(<QuotasList data={data} />)
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('caps percentage display at 100% when usage exceeds limit', () => {
    render(<QuotasList data={[makeQuota({ used: 1200, limit: 1000 })]} />)
    expect(screen.getByTestId('quota-pct-Sessions')).toHaveTextContent('120%')
  })

  it('shows 0% when limit is 0', () => {
    render(<QuotasList data={[makeQuota({ used: 0, limit: 0 })]} />)
    expect(screen.getByTestId('quota-pct-Sessions')).toHaveTextContent('0%')
  })

  it('formats large remaining values compactly', () => {
    render(
      <QuotasList
        data={[makeQuota({ name: 'Tokens', used: 547_500_000, limit: 1_000_000_000, unit: 'tokens/month' })]}
      />,
    )
    expect(screen.getByTestId('quota-remaining-Tokens')).toHaveTextContent('452.5M remaining')
  })

  it('shows Warning badge at exactly 75%', () => {
    render(<QuotasList data={[makeQuota({ used: 750, limit: 1000 })]} />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('shows Critical badge at exactly 90%', () => {
    render(<QuotasList data={[makeQuota({ used: 900, limit: 1000 })]} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })
})
