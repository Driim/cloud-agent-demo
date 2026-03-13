import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSSEOptions<T> {
  readonly url: string
  // ⚠️ EventSource API does not support custom request headers (browser limitation).
  // Token is passed as a query parameter as a workaround — it will appear in server
  // logs and browser history. Use short-lived, read-only tokens only.
  // See: https://github.com/whatwg/fetch/issues/349
  // TODO(backend): replace with a server-issued short-lived SSE ticket
  // to avoid leaking the main bearer token in URLs and server logs.
  //
  // Accepts a getter function so the latest token is always resolved when
  // reconnecting, rather than the value captured at component mount time.
  readonly token?: string | (() => string)
  readonly enabled?: boolean
  readonly maxEvents?: number
  readonly onEvent?: (event: T) => void
}

interface UseSSEResult<T> {
  readonly events: readonly T[]
  readonly isConnected: boolean
  readonly error: string | null
}

export function useSSE<T>({
  url,
  token,
  enabled = true,
  maxEvents = 50,
  onEvent,
}: UseSSEOptions<T>): UseSSEResult<T> {
  const [events, setEvents] = useState<readonly T[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const retriesRef = useRef(0)
  const maxRetries = 5

  // Store callbacks/values that should not trigger reconnects in refs
  const onEventRef = useRef<((event: T) => void) | undefined>(onEvent)
  onEventRef.current = onEvent

  const maxEventsRef = useRef(maxEvents)
  maxEventsRef.current = maxEvents

  // Resolve token lazily so reconnects always use the latest value
  const tokenRef = useRef(token)
  tokenRef.current = token
  const resolveToken = useCallback((): string | undefined => {
    const t = tokenRef.current
    return typeof t === 'function' ? t() : t
  }, [])

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    // Reset retry counter whenever url/enabled changes so a fresh URL
    // is not rejected immediately due to a prior failure's exhausted retries
    retriesRef.current = 0

    function connect() {
      cleanup()

      const resolvedToken = resolveToken()
      const fullUrl = resolvedToken
        ? `${url}?token=${encodeURIComponent(resolvedToken)}`
        : url
      const source = new EventSource(fullUrl)
      sourceRef.current = source

      source.onopen = () => {
        setIsConnected(true)
        setError(null)
        retriesRef.current = 0
      }

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data as string) as T
          setEvents((prev) => {
            const updated = [parsed, ...prev]
            return updated.slice(0, maxEventsRef.current)
          })
          onEventRef.current?.(parsed)
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn('[useSSE] Failed to parse event:', err)
          }
        }
      }

      source.onerror = () => {
        source.close()
        setIsConnected(false)

        if (retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 30_000)
          retriesRef.current += 1
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        } else {
          setError('Connection lost. Max retries reached.')
        }
      }
    }

    connect()
    return cleanup
  }, [url, enabled, cleanup, resolveToken])

  return { events, isConnected, error }
}
