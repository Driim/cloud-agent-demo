import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingSkeleton from './LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('renders the correct number of skeleton lines', () => {
    const { container } = render(<LoadingSkeleton lines={5} />)
    const bars = container.querySelectorAll('.animate-pulse > div')
    expect(bars).toHaveLength(5)
  })

  it('defaults to 3 lines', () => {
    const { container } = render(<LoadingSkeleton />)
    const bars = container.querySelectorAll('.animate-pulse > div')
    expect(bars).toHaveLength(3)
  })

  it('never produces a width below 20% even with lines=8', () => {
    const { container } = render(<LoadingSkeleton lines={8} />)
    const bars = container.querySelectorAll<HTMLDivElement>('.animate-pulse > div')
    expect(bars).toHaveLength(8)
    bars.forEach((bar) => {
      const width = parseFloat(bar.style.width)
      expect(width).toBeGreaterThanOrEqual(20)
    })
  })
})
