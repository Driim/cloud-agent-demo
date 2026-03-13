import { useQuery } from '@tanstack/react-query'
import { apiFetch, buildQueryString } from './client'
import type {
  AdoptionRateResponse,
  CostResponse,
  DurationBucket,
  ErrorDistributionResponse,
  MultiSeriesResponse,
  OverviewResponse,
  QuotaItem,
  SessionOutcomesResponse,
  TimeSeriesGranularity,
  TimeSeriesMetric,
  TimeSeriesRange,
  TimeSeriesResponse,
  TokensPerPRResponse,
} from '../types/api'

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiFetch<OverviewResponse>('/analytics/overview'),
  })
}

export function useTimeseries(
  metric: TimeSeriesMetric,
  range: TimeSeriesRange = '30d',
  granularity: TimeSeriesGranularity = 'day',
) {
  return useQuery({
    queryKey: ['analytics', 'timeseries', metric, range, granularity],
    queryFn: () =>
      apiFetch<TimeSeriesResponse>(
        `/analytics/timeseries/${metric}${buildQueryString({ range, granularity })}`,
      ),
  })
}

export function useQuotas() {
  return useQuery({
    queryKey: ['analytics', 'quotas'],
    queryFn: () => apiFetch<readonly QuotaItem[]>('/analytics/quotas'),
  })
}

export function useCosts() {
  return useQuery({
    queryKey: ['analytics', 'costs'],
    queryFn: () => apiFetch<CostResponse>('/analytics/costs'),
  })
}

export function useErrors() {
  return useQuery({
    queryKey: ['analytics', 'errors'],
    queryFn: () =>
      apiFetch<ErrorDistributionResponse>('/analytics/errors'),
  })
}

export function useTokenBreakdown(
  range: TimeSeriesRange = '30d',
  granularity: TimeSeriesGranularity = 'day',
) {
  return useQuery({
    queryKey: ['analytics', 'token-breakdown', range, granularity],
    queryFn: () =>
      apiFetch<MultiSeriesResponse>(
        `/analytics/token-breakdown${buildQueryString({ range, granularity })}`,
      ),
  })
}

export function useSessionOutcomes() {
  return useQuery({
    queryKey: ['analytics', 'session-outcomes'],
    queryFn: () =>
      apiFetch<SessionOutcomesResponse>('/analytics/session-outcomes'),
  })
}

export function useTokensPerPR() {
  return useQuery({
    queryKey: ['analytics', 'tokens-per-pr'],
    queryFn: () =>
      apiFetch<TokensPerPRResponse>('/analytics/tokens-per-pr'),
  })
}

export function useDurationDistribution() {
  return useQuery({
    queryKey: ['analytics', 'duration-distribution'],
    queryFn: () =>
      apiFetch<readonly DurationBucket[]>('/analytics/duration-distribution'),
  })
}

export function useAdoptionRate() {
  return useQuery({
    queryKey: ['analytics', 'adoption-rate'],
    queryFn: () =>
      apiFetch<AdoptionRateResponse>('/analytics/adoption-rate'),
  })
}
