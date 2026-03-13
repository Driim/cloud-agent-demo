import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { TeamMemberStats } from '../types/api'

export function useTeamStats() {
  return useQuery({
    queryKey: ['analytics', 'team'],
    queryFn: () => apiFetch<readonly TeamMemberStats[]>('/analytics/team'),
  })
}
