import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSSE } from './useSSE'

// ── EventSource mock ─────────────────────────────────────────────────────────

class MockEventSource {
  static instances: MockEventSource[] = []

  readonly url: string
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  closed = false

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close() {
    this.closed = true
  }

  // Test helpers — each wraps in act() so React processes state updates
  simulateOpen() {
    act(() => { this.onopen?.() })
  }

  simulateMessage(data: unknown) {
    act(() => { this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent) })
  }

  simulateError() {
    act(() => { this.onerror?.() })
  }
}

function latestSource(): MockEventSource {
  return MockEventSource.instances[MockEventSource.instances.length - 1]
}

// ── Test suite ───────────────────────────────────────────────────────────────

beforeEach(() => {
  MockEventSource.instances = []
  vi.stubGlobal('EventSource', MockEventSource)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useSSE — connection lifecycle', () => {
  it('does not create EventSource when disabled', () => {
    renderHook(() => useSSE({ url: '/events', enabled: false }))
    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('creates EventSource with the given URL', () => {
    renderHook(() => useSSE({ url: '/api/events' }))
    expect(MockEventSource.instances).toHaveLength(1)
    expect(latestSource().url).toBe('/api/events')
  })

  it('appends token as query param when provided', () => {
    renderHook(() => useSSE({ url: '/api/events', token: 'tok123' }))
    expect(latestSource().url).toBe('/api/events?token=tok123')
  })

  it('URL-encodes the token', () => {
    renderHook(() => useSSE({ url: '/api/events', token: 'a/b+c' }))
    expect(latestSource().url).toBe('/api/events?token=a%2Fb%2Bc')
  })

  it('sets isConnected=true on open and clears error', () => {
    const { result } = renderHook(() => useSSE({ url: '/api/events' }))
    latestSource().simulateOpen()
    expect(result.current.isConnected).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSSE({ url: '/api/events' }))
    const src = latestSource()
    unmount()
    expect(src.closed).toBe(true)
  })

  it('closes connection when disabled after being enabled', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSSE({ url: '/api/events', enabled }),
      { initialProps: { enabled: true } },
    )
    expect(MockEventSource.instances).toHaveLength(1)
    rerender({ enabled: false })
    expect(latestSource().closed).toBe(true)
  })
})

describe('useSSE — message handling', () => {
  it('adds parsed event to events array', () => {
    const { result } = renderHook(() => useSSE<{ type: string }>({ url: '/api/events' }))
    latestSource().simulateMessage({ type: 'ping' })
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0]).toEqual({ type: 'ping' })
  })

  it('prepends new events (most recent first)', () => {
    const { result } = renderHook(() => useSSE<{ n: number }>({ url: '/api/events' }))
    const src = latestSource()
    src.simulateMessage({ n: 1 })
    src.simulateMessage({ n: 2 })
    expect(result.current.events[0]).toEqual({ n: 2 })
    expect(result.current.events[1]).toEqual({ n: 1 })
  })

  it('respects maxEvents cap (drops oldest)', () => {
    const { result } = renderHook(() => useSSE<{ n: number }>({ url: '/api/events', maxEvents: 2 }))
    const src = latestSource()
    src.simulateMessage({ n: 1 })
    src.simulateMessage({ n: 2 })
    src.simulateMessage({ n: 3 })
    expect(result.current.events).toHaveLength(2)
    expect(result.current.events[0]).toEqual({ n: 3 })
  })

  it('calls onEvent callback for each message', () => {
    const onEvent = vi.fn()
    renderHook(() => useSSE<{ type: string }>({ url: '/api/events', onEvent }))
    latestSource().simulateMessage({ type: 'ping' })
    expect(onEvent).toHaveBeenCalledOnce()
    expect(onEvent).toHaveBeenCalledWith({ type: 'ping' })
  })

  it('does not throw and drops the event on invalid JSON', () => {
    const { result } = renderHook(() => useSSE({ url: '/api/events' }))
    expect(() => {
      act(() => { latestSource().onmessage?.({ data: 'not-valid-json' } as MessageEvent) })
    }).not.toThrow()
    expect(result.current.events).toHaveLength(0)
  })
})

describe('useSSE — reconnect & error handling', () => {
  it('sets isConnected=false on error and schedules reconnect', () => {
    const { result } = renderHook(() => useSSE({ url: '/api/events' }))
    latestSource().simulateOpen()
    expect(result.current.isConnected).toBe(true)

    latestSource().simulateError()
    expect(result.current.isConnected).toBe(false)

    // After first delay (1 s) a new connection is attempted
    act(() => { vi.advanceTimersByTime(1_000) })
    expect(MockEventSource.instances).toHaveLength(2)
  })

  it('sets error state after exhausting all retries (5)', () => {
    const { result } = renderHook(() => useSSE({ url: '/api/events' }))
    const delays = [1_000, 2_000, 4_000, 8_000, 16_000]

    // Fire 5 errors, each followed by a reconnect
    for (const delay of delays) {
      latestSource().simulateError()
      act(() => { vi.advanceTimersByTime(delay) })
    }

    // 6th error — no retries left
    latestSource().simulateError()
    expect(result.current.error).toBe('Connection lost. Max retries reached.')
  })

  it('resets retry counter after a successful open', () => {
    const { result } = renderHook(() => useSSE({ url: '/api/events' }))

    // Fail once, reconnect
    latestSource().simulateError()
    act(() => { vi.advanceTimersByTime(1_000) })

    // Succeed on the new connection
    latestSource().simulateOpen()
    expect(result.current.isConnected).toBe(true)
    expect(result.current.error).toBeNull()
  })
})
