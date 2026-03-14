import { useState, useRef, useEffect, useCallback } from 'react'
import type { SessionStatus } from '../../types/api'

interface SessionFiltersProps {
  readonly status: SessionStatus | undefined
  readonly onStatusChange: (status: SessionStatus | undefined) => void
}

const STATUSES: readonly { readonly value: SessionStatus; readonly label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'merged', label: 'Merged' },
  { value: 'failed', label: 'Failed' },
  { value: 'timed_out', label: 'Timed Out' },
]

const STATUS_COLORS: Record<SessionStatus, string> = {
  completed: 'bg-emerald-500',
  merged: 'bg-emerald-500',
  failed: 'bg-red-500',
  timed_out: 'bg-amber-500',
}

function getSelectedLabel(status: SessionStatus | undefined): string {
  if (!status) return 'All statuses'
  return STATUSES.find((s) => s.value === status)?.label ?? 'All statuses'
}

function SessionFilters({ status, onStatusChange }: SessionFiltersProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, handleClickOutside])

  const handleSelect = (value: SessionStatus | undefined) => {
    onStatusChange(value)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="flex gap-3">
      <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-44 items-center justify-between rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-neutral-300 transition-colors hover:border-white/20 hover:bg-surface-hover focus:outline-none focus:ring-1 focus:ring-ai-purple"
        >
          <span className="flex items-center gap-2">
            {status && (
              <span className={`inline-block h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
            )}
            {getSelectedLabel(status)}
          </span>
          <i className={`ri-arrow-down-s-line text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-white/10 bg-[var(--color-surface)] p-1 shadow-lg backdrop-blur-sm"
          >
            <li
              role="option"
              aria-selected={!status}
              onClick={() => handleSelect(undefined)}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                !status ? 'text-white' : 'text-neutral-300'
              }`}
            >
              All statuses
            </li>
            {STATUSES.map((s) => (
              <li
                key={s.value}
                role="option"
                aria-selected={status === s.value}
                onClick={() => handleSelect(s.value)}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                  status === s.value ? 'text-white' : 'text-neutral-300'
                }`}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${STATUS_COLORS[s.value]}`} />
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SessionFilters
