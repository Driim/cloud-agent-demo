import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { RepositoryStats } from '../types/api'

export function useRepositories() {
  return useQuery({
    queryKey: ['analytics', 'repositories'],
    queryFn: () =>
      apiFetch<readonly RepositoryStats[]>('/analytics/repositories'),
  })
}
