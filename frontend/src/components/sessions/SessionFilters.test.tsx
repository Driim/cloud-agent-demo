import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SessionFilters from './SessionFilters'

describe('SessionFilters', () => {
  it('renders with "All statuses" when no status selected', () => {
    render(<SessionFilters status={undefined} onStatusChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('All statuses')
  })

  it('renders the selected status label', () => {
    render(<SessionFilters status="failed" onStatusChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Failed')
  })

  it('opens dropdown and shows all options', async () => {
    const user = userEvent.setup()
    render(<SessionFilters status={undefined} onStatusChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  it('calls onStatusChange with status value when option clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SessionFilters status={undefined} onStatusChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /Completed/ }))

    expect(onChange).toHaveBeenCalledWith('completed')
  })

  it('calls onStatusChange with undefined when "All statuses" clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SessionFilters status="failed" onStatusChange={onChange} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /All statuses/ }))

    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('renders all four status options with labels', async () => {
    const user = userEvent.setup()
    render(<SessionFilters status={undefined} onStatusChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: /Completed/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Merged/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Failed/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Timed Out/ })).toBeInTheDocument()
  })

  it('closes dropdown on Escape key', async () => {
    const user = userEvent.setup()
    render(<SessionFilters status={undefined} onStatusChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <span data-testid="outside">outside</span>
        <SessionFilters status={undefined} onStatusChange={vi.fn()} />
      </div>,
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
