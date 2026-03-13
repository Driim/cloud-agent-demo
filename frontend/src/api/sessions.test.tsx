import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSessions, useSession } from './sessions'
import * as clientModule from './client'

// vi.hoisted ensures this is available inside the hoisted vi.mock factory
const mockPaginatedResponse = vi.hoisted(() => ({
  data: [] as never[],
  pagination: { next_cursor: null, prev_cursor: null, has_more: false, limit: 20, approx_total: 0 },
}))

// Keep real buildQueryString so URLs are generated correctly; mock only apiFetch
vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>()
  return { ...actual, apiFetch: vi.fn().mockResolvedValue(mockPaginatedResponse) }
})

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useSessions — limit clamping', () => {
  beforeEach(() => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockPaginatedResponse)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('clamps limit to 100 when above MAX_PAGE_SIZE', async () => {
    const { result } = renderHook(() => useSessions({ limit: 999 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(clientModule.apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('limit=100'),
    )
  })

  it('clamps limit to 1 when below MIN_PAGE_SIZE', async () => {
    const { result } = renderHook(() => useSessions({ limit: 0 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(clientModule.apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('limit=1'),
    )
  })

  it('clamps negative limit to 1', async () => {
    const { result } = renderHook(() => useSessions({ limit: -5 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(clientModule.apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('limit=1'),
    )
  })

  it('truncates fractional limit', async () => {
    const { result } = renderHook(() => useSessions({ limit: 25.9 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(clientModule.apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('limit=25'),
    )
  })

  it('passes valid limit unchanged', async () => {
    const { result } = renderHook(() => useSessions({ limit: 20 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(clientModule.apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('limit=20'),
    )
  })

  it('omits limit from URL when not provided', async () => {
    const { result } = renderHook(() => useSessions({}), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const calledUrl = vi.mocked(clientModule.apiFetch).mock.calls[0][0] as string
    expect(calledUrl).not.toContain('limit')
  })
})

describe('useSession', () => {
  const mockDetail = { session_id: 'abc', repo: 'org/repo' }

  beforeEach(() => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockDetail)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches session by id', async () => {
    const { result } = renderHook(() => useSession('abc'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(clientModule.apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/abc'),
    )
  })

  it('does not fetch when sessionId is empty', () => {
    const { result } = renderHook(() => useSession(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(vi.mocked(clientModule.apiFetch)).not.toHaveBeenCalled()
  })
})
