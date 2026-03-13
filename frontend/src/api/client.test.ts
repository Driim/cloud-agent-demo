import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError, buildQueryString, apiFetch, setAuthToken, getAuthToken } from './client'

// ── ApiError ────────────────────────────────────────────────────────────────

describe('ApiError', () => {
  it('extends Error and stores status/statusText/message', () => {
    const err = new ApiError(404, 'Not Found', 'Session not found')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiError')
    expect(err.status).toBe(404)
    expect(err.statusText).toBe('Not Found')
    expect(err.message).toBe('Session not found')
  })

  it('works for 5xx errors', () => {
    const err = new ApiError(500, 'Internal Server Error', 'Something broke')
    expect(err.status).toBe(500)
  })
})

// ── Token management ─────────────────────────────────────────────────────────

describe('token management', () => {
  const originalToken = getAuthToken()

  afterEach(() => setAuthToken(originalToken))

  it('stores and retrieves a token', () => {
    setAuthToken('test-token-abc')
    expect(getAuthToken()).toBe('test-token-abc')
  })

  it('overwrites a previously stored token', () => {
    setAuthToken('first')
    setAuthToken('second')
    expect(getAuthToken()).toBe('second')
  })
})

// ── buildQueryString ─────────────────────────────────────────────────────────

describe('buildQueryString', () => {
  it('returns empty string for empty params', () => {
    expect(buildQueryString({})).toBe('')
  })

  it('omits undefined values', () => {
    expect(buildQueryString({ a: 'x', b: undefined })).toBe('?a=x')
  })

  it('includes string and number values', () => {
    const qs = buildQueryString({ status: 'completed', limit: 20 })
    expect(qs).toContain('status=completed')
    expect(qs).toContain('limit=20')
  })

  it('includes boolean values', () => {
    const qs = buildQueryString({ active: true, deleted: false })
    expect(qs).toContain('active=true')
    expect(qs).toContain('deleted=false')
  })

  it('URL-encodes special characters', () => {
    const qs = buildQueryString({ q: 'hello world' })
    expect(qs).toBe('?q=hello+world')
  })

  it('returns empty string when all values are undefined', () => {
    expect(buildQueryString({ a: undefined, b: undefined })).toBe('')
  })
})

// ── apiFetch ─────────────────────────────────────────────────────────────────

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON on 200 response', async () => {
    const payload = { id: 1, name: 'test' }
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }))

    const result = await apiFetch<typeof payload>('/test')
    expect(result).toEqual(payload)
  })

  it('prefixes path with BASE_URL /api/v1', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await apiFetch('/sessions')
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/v1/sessions')
  })

  it('sends Authorization header with current token', async () => {
    setAuthToken('bearer-xyz')
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await apiFetch('/test')
    const options = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer bearer-xyz')
  })

  it('sets Content-Type to application/json', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }))

    await apiFetch('/test')
    const options = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('throws ApiError with status and body on error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Session not found', { status: 404, statusText: 'Not Found' }))

    await expect(apiFetch('/sessions/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Session not found',
    })
  })

  it('falls back to statusText when body is empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 500, statusText: 'Internal Server Error' }))

    await expect(apiFetch('/error')).rejects.toMatchObject({
      status: 500,
      message: 'Internal Server Error',
    })
  })

  it('throws ApiError instance on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' }))

    await expect(apiFetch('/protected')).rejects.toBeInstanceOf(ApiError)
  })
})
