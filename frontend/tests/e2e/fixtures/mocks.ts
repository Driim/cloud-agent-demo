import type { Page } from '@playwright/test'
import type {
  OverviewResponse,
  TimeSeriesResponse,
  MultiSeriesResponse,
  SessionOutcomesResponse,
  ErrorDistributionResponse,
  PaginatedSessionsResponse,
  SessionDetail,
  CostResponse,
  QuotaItem,
  TeamMemberStats,
  TokensPerPRResponse,
} from '../../../src/types/api'

// ── Mock data (aligned with backend benchmarks) ──────────────────────────

export const mockOverview: OverviewResponse = {
  total_sessions: 1_050,
  total_tokens: 547_500_000,
  total_spend_usd: 2_580.0,
  total_prs_merged: 262,
  success_rate: 71.0,
  avg_cost_per_pr_usd: 9.85,
  top_repos: [
    { repo: 'acme-corp/backend-api', sessions: 231 },
    { repo: 'acme-corp/frontend-app', sessions: 189 },
    { repo: 'acme-corp/auth-service', sessions: 147 },
  ],
}

export const mockTokenSeries: TimeSeriesResponse = {
  metric: 'tokens',
  range: '30d',
  granularity: 'day',
  points: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    value: 18_000_000 + Math.floor(Math.random() * 8_000_000),
  })),
}

export const mockSpendSeries: TimeSeriesResponse = {
  metric: 'spend',
  range: '30d',
  granularity: 'day',
  points: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    value: 180 + Math.floor(Math.random() * 40),
  })),
}

export const mockErrors: ErrorDistributionResponse = {
  total_errors: 276,
  items: [
    { error_type: 'timeout', count: 89, percentage: 32.2 },
    { error_type: 'context_overflow', count: 64, percentage: 23.2 },
    { error_type: 'tool_call_failed', count: 42, percentage: 15.2 },
  ],
}

export const mockSessions: PaginatedSessionsResponse = {
  data: [
    {
      session_id: 'sess_001',
      repo: 'acme-corp/backend-api',
      user: 'alice@acme-corp.io',
      status: 'completed',
      started_at: '2026-03-12T09:00:00Z',
      duration_sec: 1_823,
      tokens_used: 580_000,
      cost_usd: 3.48,
      pr_number: 101,
    },
    {
      session_id: 'sess_002',
      repo: 'acme-corp/frontend-app',
      user: 'bob@acme-corp.io',
      status: 'failed',
      started_at: '2026-03-12T10:00:00Z',
      duration_sec: 543,
      tokens_used: 120_000,
      cost_usd: 0.72,
      pr_number: null,
    },
    {
      session_id: 'sess_003',
      repo: 'acme-corp/data-pipeline',
      user: 'carol@acme-corp.io',
      status: 'merged',
      started_at: '2026-03-12T11:00:00Z',
      duration_sec: 3_210,
      tokens_used: 1_200_000,
      cost_usd: 7.20,
      pr_number: 205,
    },
  ],
  pagination: {
    next_cursor: 'cursor-next-abc',
    prev_cursor: null,
    has_more: true,
    limit: 20,
    approx_total: 1_050,
  },
}

export const mockSessionDetail: SessionDetail = {
  session_id: 'sess_001',
  repo: 'acme-corp/backend-api',
  user: 'alice@acme-corp.io',
  status: 'completed',
  started_at: '2026-03-12T09:00:00Z',
  finished_at: '2026-03-12T09:30:23Z',
  duration_sec: 1_823,
  tokens_used: 580_000,
  cost_usd: 3.48,
  pr_number: 101,
  pr_url: 'https://github.com/acme-corp/backend-api/pull/101',
  branch: 'feat/add-auth',
  commit_count: 3,
  files_changed: 7,
  timeline: [
    {
      timestamp: '2026-03-12T09:00:00Z',
      event_type: 'session_started',
      description: 'Session started',
    },
    {
      timestamp: '2026-03-12T09:15:00Z',
      event_type: 'tool_call',
      description: 'Agent executed code analysis',
    },
    {
      timestamp: '2026-03-12T09:30:23Z',
      event_type: 'session_completed',
      description: 'Session completed successfully',
    },
  ],
}

export const mockCosts: CostResponse = {
  total_usd: 2_580.0,
  breakdown: [
    { category: 'LLM tokens (output)', amount_usd: 1_341.6, percentage: 52 },
    { category: 'Compute (sandboxes)', amount_usd: 567.6, percentage: 22 },
    { category: 'LLM tokens (input)', amount_usd: 464.4, percentage: 18 },
    { category: 'Storage & egress', amount_usd: 206.4, percentage: 8 },
  ],
  trend: [
    { month: '2025-07', amount_usd: 1_041.0 },
    { month: '2025-08', amount_usd: 1_166.0 },
    { month: '2025-09', amount_usd: 1_306.0 },
    { month: '2025-10', amount_usd: 1_463.0 },
    { month: '2025-11', amount_usd: 1_639.0 },
    { month: '2025-12', amount_usd: 1_836.0 },
    { month: '2026-01', amount_usd: 2_057.0 },
    { month: '2026-02', amount_usd: 2_304.0 },
    { month: '2026-03', amount_usd: 2_580.0 },
  ],
}

export const mockQuotas: QuotaItem[] = [
  { name: 'Sessions', used: 1_050, limit: 1_500, unit: 'sessions/month' },
  { name: 'Tokens', used: 547_500_000, limit: 1_000_000_000, unit: 'tokens/month' },
  { name: 'Concurrent agents', used: 4, limit: 10, unit: 'agents' },
]

export const mockTeam: TeamMemberStats[] = [
  {
    user: 'elena@acme-corp.io',
    display_name: 'Elena Petrova',
    sessions: 35,
    tokens_used: 23_800_000,
    prs_merged: 9,
    success_rate: 85.3,
    avg_session_duration_sec: 2_100,
    total_cost_usd: 112.2,
  },
  {
    user: 'alice@acme-corp.io',
    display_name: 'Alice Chen',
    sessions: 52,
    tokens_used: 32_240_000,
    prs_merged: 13,
    success_rate: 82.4,
    avg_session_duration_sec: 1_680,
    total_cost_usd: 151.9,
  },
  {
    user: 'bob@acme-corp.io',
    display_name: 'Bob Martinez',
    sessions: 68,
    tokens_used: 36_540_000,
    prs_merged: 17,
    success_rate: 74.2,
    avg_session_duration_sec: 1_500,
    total_cost_usd: 172.2,
  },
]

export const mockTokensPerPR: TokensPerPRResponse = {
  avg_tokens_per_pr: 53_810,
  delta_pct: -4.2,
}

export const mockTokenBreakdown: MultiSeriesResponse = {
  metric: 'token_breakdown',
  range: '30d',
  granularity: 'day',
  points: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    input_tokens: 8_000_000 + Math.floor(Math.random() * 4_000_000),
    output_tokens: 10_000_000 + Math.floor(Math.random() * 4_000_000),
  })),
}

export const mockSessionOutcomes: SessionOutcomesResponse = {
  total: 1_050,
  items: [
    { status: 'completed', count: 525, percentage: 50 },
    { status: 'merged', count: 262, percentage: 25 },
    { status: 'failed', count: 179, percentage: 17 },
    { status: 'timed_out', count: 84, percentage: 8 },
  ],
}

export const mockCostPerSessionSeries: TimeSeriesResponse = {
  metric: 'cost_per_session',
  range: '30d',
  granularity: 'day',
  points: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    value: 3.0 + Math.random() * 1.0,
  })),
}

// ── Route mock helpers ─────────────────────────────────────────────────────

export async function mockApiRoutes(page: Page): Promise<void> {
  await page.route('**/api/v1/analytics/overview', (route) =>
    route.fulfill({ json: mockOverview }),
  )

  await page.route('**/api/v1/analytics/timeseries/tokens**', (route) =>
    route.fulfill({ json: mockTokenSeries }),
  )

  await page.route('**/api/v1/analytics/timeseries/spend**', (route) =>
    route.fulfill({ json: mockSpendSeries }),
  )

  await page.route('**/api/v1/analytics/token-breakdown**', (route) =>
    route.fulfill({ json: mockTokenBreakdown }),
  )

  await page.route('**/api/v1/analytics/session-outcomes', (route) =>
    route.fulfill({ json: mockSessionOutcomes }),
  )

  await page.route('**/api/v1/analytics/errors', (route) =>
    route.fulfill({ json: mockErrors }),
  )

  await page.route('**/api/v1/sessions**', (route) => {
    const url = new URL(route.request().url())
    const sessionId = url.pathname.split('/sessions/')[1]
    if (sessionId) {
      route.fulfill({ json: mockSessionDetail })
    } else {
      route.fulfill({ json: mockSessions })
    }
  })

  await page.route('**/api/v1/analytics/costs', (route) =>
    route.fulfill({ json: mockCosts }),
  )

  await page.route('**/api/v1/analytics/quotas', (route) =>
    route.fulfill({ json: mockQuotas }),
  )

  await page.route('**/api/v1/analytics/tokens-per-pr', (route) =>
    route.fulfill({ json: mockTokensPerPR }),
  )

  await page.route('**/api/v1/analytics/timeseries/cost_per_session**', (route) =>
    route.fulfill({ json: mockCostPerSessionSeries }),
  )

  await page.route('**/api/v1/analytics/team', (route) =>
    route.fulfill({ json: mockTeam }),
  )

  // SSE feed — return empty event stream
  await page.route('**/api/v1/analytics/team/feed', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: '',
    }),
  )
}
