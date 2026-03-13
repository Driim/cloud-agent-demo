// TypeScript types matching backend Pydantic schemas

// ── Auth ──

export interface TokenRequest {
  readonly email: string
  readonly password: string
}

export interface TokenResponse {
  readonly access_token: string
  readonly refresh_token: string
  readonly token_type: string
}

export interface UserProfile {
  readonly user_id: string
  readonly email: string
  readonly org_id: string
  readonly role: string
  readonly plan: string
}

// ── Sessions ──

export type SessionStatus = 'completed' | 'merged' | 'failed' | 'timed_out'

export interface SessionSummary {
  readonly session_id: string
  readonly repo: string
  readonly user: string
  readonly status: SessionStatus
  readonly started_at: string
  readonly duration_sec: number
  readonly tokens_used: number
  readonly cost_usd: number
  readonly pr_number: number | null
}

export interface TimelineEvent {
  readonly timestamp: string
  readonly event_type: string
  readonly description: string
}

export interface SessionDetail {
  readonly session_id: string
  readonly repo: string
  readonly user: string
  readonly status: SessionStatus
  readonly started_at: string
  readonly finished_at: string
  readonly duration_sec: number
  readonly tokens_used: number
  readonly cost_usd: number
  readonly pr_number: number | null
  readonly pr_url: string | null
  readonly branch: string
  readonly commit_count: number
  readonly files_changed: number
  readonly timeline: readonly TimelineEvent[]
}

export interface PaginationMeta {
  readonly next_cursor: string | null
  readonly prev_cursor: string | null
  readonly has_more: boolean
  readonly limit: number
  readonly approx_total: number
}

export interface PaginatedSessionsResponse {
  readonly data: readonly SessionSummary[]
  readonly pagination: PaginationMeta
}

// ── Analytics ──

export interface RepoActivity {
  readonly repo: string
  readonly sessions: number
}

export interface OverviewResponse {
  readonly total_sessions: number
  readonly total_tokens: number
  readonly total_spend_usd: number
  readonly total_prs_merged: number
  readonly success_rate: number
  readonly avg_cost_per_pr_usd: number
  readonly top_repos: readonly RepoActivity[]
}

export interface TimeSeriesPoint {
  readonly timestamp: string
  readonly value: number
}

export type TimeSeriesMetric = 'tokens' | 'sessions' | 'spend' | 'prs'
export type TimeSeriesRange = '7d' | '30d' | '90d'
export type TimeSeriesGranularity = 'hour' | 'day'

export interface TimeSeriesResponse {
  readonly metric: string
  readonly range: string
  readonly granularity: string
  readonly points: readonly TimeSeriesPoint[]
}

export interface QuotaItem {
  readonly name: string
  readonly used: number
  readonly limit: number
  readonly unit: string
}

export interface CostLineItem {
  readonly category: string
  readonly amount_usd: number
  readonly percentage: number
}

export interface CostTrend {
  readonly month: string
  readonly amount_usd: number
}

export interface CostResponse {
  readonly total_usd: number
  readonly breakdown: readonly CostLineItem[]
  readonly trend: readonly CostTrend[]
}

export interface ErrorDistributionItem {
  readonly error_type: string
  readonly count: number
  readonly percentage: number
}

export interface ErrorDistributionResponse {
  readonly total_errors: number
  readonly items: readonly ErrorDistributionItem[]
}

// ── Team ──

export interface TeamMemberStats {
  readonly user: string
  readonly display_name: string
  readonly sessions: number
  readonly tokens_used: number
  readonly prs_merged: number
  readonly success_rate: number
  readonly avg_session_duration_sec: number
  readonly total_cost_usd: number
}

export type ActivityEventType =
  | 'session_started'
  | 'session_completed'
  | 'pr_merged'
  | 'session_failed'

export interface ActivityEvent {
  readonly event_id: string
  readonly timestamp: string
  readonly event_type: ActivityEventType
  readonly user: string
  readonly repo: string
  readonly description: string
}

// ── Repositories ──

export interface RepositoryStats {
  readonly repo: string
  readonly sessions: number
  readonly tokens_used: number
  readonly prs_merged: number
  readonly success_rate: number
  readonly total_cost_usd: number
  readonly top_contributor: string
  readonly last_session_at: string
}

// ── Sessions query params ──

export interface SessionsQueryParams {
  readonly status?: SessionStatus
  readonly repo?: string
  readonly user?: string
  readonly cursor?: string
  readonly limit?: number
}
