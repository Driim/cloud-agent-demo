import { useQuery } from '@tanstack/react-query'
import { apiFetch, buildQueryString } from './client'
import type {
  PaginatedSessionsResponse,
  SessionDetail,
  SessionsQueryParams,
} from '../types/api'

const MIN_PAGE_SIZE = 1
const MAX_PAGE_SIZE = 100

export function useSessions(params: SessionsQueryParams = {}) {
  const safeParams: SessionsQueryParams = {
    ...params,
    ...(params.limit !== undefined && {
      limit: Math.min(Math.max(Math.trunc(params.limit), MIN_PAGE_SIZE), MAX_PAGE_SIZE),
    }),
  }
  return useQuery({
    queryKey: ['sessions', 'list', safeParams],
    queryFn: () =>
      apiFetch<PaginatedSessionsResponse>(
        `/sessions${buildQueryString(safeParams as Record<string, string | number | undefined>)}`,
      ),
    staleTime: 30_000,
  })
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', 'detail', sessionId],
    queryFn: () => apiFetch<SessionDetail>(`/sessions/${sessionId}`),
    enabled: !!sessionId,
  })
}
