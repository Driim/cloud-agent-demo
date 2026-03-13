export const BASE_URL = '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly statusText: string

  constructor(status: number, statusText: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
  }
}

// Token storage — call setAuthToken() from your auth context after login.
// In development the mock token lets the app run without a real auth flow.
// In production this starts empty; setAuthToken() must be called after login.
let _authToken = import.meta.env.DEV ? 'mock-access-token' : ''

export function setAuthToken(token: string): void {
  _authToken = token
}

export function getAuthToken(): string {
  return _authToken
}

const REQUEST_TIMEOUT_MS = 30_000

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
    Authorization: `Bearer ${getAuthToken()}`,
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new ApiError(response.status, response.statusText, body || response.statusText)
    }

    return response.json() as Promise<T>
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout', 'Request timed out. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] =>
      entry[1] !== undefined,
  )
  if (entries.length === 0) return ''
  const searchParams = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)]),
  )
  return `?${searchParams.toString()}`
}
