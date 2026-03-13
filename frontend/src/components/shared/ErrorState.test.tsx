import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorState from './ErrorState'

// Tremor's Callout renders its children; we keep it real to test actual output.
// If Tremor changes its DOM structure, update assertions here, not the component.

describe('ErrorState', () => {
  it('renders the error message', () => {
    render(<ErrorState message="Something went wrong. Please try again." />)
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('shows the Retry button when onRetry is provided', () => {
    render(<ErrorState message="Oops" onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('calls onRetry when the Retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Oops" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not render Retry button when onRetry is not provided', () => {
    render(<ErrorState message="Oops" />)
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })
})
