import { useQuery } from '@tanstack/react-query'
import { apiFetch, buildQueryString } from './client'
import type {
  CostResponse,
  ErrorDistributionResponse,
  OverviewResponse,
  QuotaItem,
  TimeSeriesGranularity,
  TimeSeriesMetric,
  TimeSeriesRange,
  TimeSeriesResponse,
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
