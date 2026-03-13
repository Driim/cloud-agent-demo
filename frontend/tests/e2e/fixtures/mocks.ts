import type { Page } from '@playwright/test'
import type {
  OverviewResponse,
  TimeSeriesResponse,
  ErrorDistributionResponse,
  PaginatedSessionsResponse,
  SessionDetail,
  CostResponse,
  QuotaItem,
  TeamMemberStats,
} from '../../../src/types/api'

// ── Mock data ──────────────────────────────────────────────────────────────

export const mockOverview: OverviewResponse = {
  total_sessions: 1247,
  total_tokens: 48_320_000,
  total_spend_usd: 1842.5,
  total_prs_merged: 892,
  success_rate: 0.87,
  avg_cost_per_pr_usd: 2.06,
  top_repos: [
    { repo: 'org/frontend', sessions: 312 },
    { repo: 'org/backend', sessions: 289 },
    { repo: 'org/infra', sessions: 201 },
  ],
}

export const mockTokenSeries: TimeSeriesResponse = {
  metric: 'tokens',
  range: '30d',
  granularity: 'day',
  points: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    value: 1_200_000 + Math.floor(Math.random() * 400_000),
  })),
}

export const mockSpendSeries: TimeSeriesResponse = {
  metric: 'spend',
  range: '30d',
  granularity: 'day',
  points: Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    value: 40 + Math.floor(Math.random() * 30),
  })),
}

export const mockErrors: ErrorDistributionResponse = {
  total_errors: 163,
  items: [
    { error_type: 'timeout', count: 89, percentage: 54.6 },
    { error_type: 'auth_failure', count: 44, percentage: 27.0 },
    { error_type: 'rate_limit', count: 30, percentage: 18.4 },
  ],
}

export const mockSessions: PaginatedSessionsResponse = {
  data: [
    {
      session_id: 'sess-aabbccdd1122',
      repo: 'org/frontend',
      user: 'alice@example.com',
      status: 'completed',
      started_at: '2024-01-15T10:00:00Z',
      duration_sec: 1823,
      tokens_used: 48500,
      cost_usd: 1.45,
      pr_number: 101,
    },
    {
      session_id: 'sess-eeff99887766',
      repo: 'org/backend',
      user: 'bob@example.com',
      status: 'failed',
      started_at: '2024-01-15T11:00:00Z',
      duration_sec: 543,
      tokens_used: 12300,
      cost_usd: 0.37,
      pr_number: null,
    },
    {
      session_id: 'sess-112233445566',
      repo: 'org/infra',
      user: 'carol@example.com',
      status: 'merged',
      started_at: '2024-01-15T12:00:00Z',
      duration_sec: 3210,
      tokens_used: 89200,
      cost_usd: 2.68,
      pr_number: 205,
    },
  ],
  pagination: {
    next_cursor: 'cursor-next-abc',
    prev_cursor: null,
    has_more: true,
    limit: 20,
    approx_total: 1247,
  },
}

export const mockSessionDetail: SessionDetail = {
  session_id: 'sess-aabbccdd1122',
  repo: 'org/frontend',
  user: 'alice@example.com',
  status: 'completed',
  started_at: '2024-01-15T10:00:00Z',
  finished_at: '2024-01-15T10:30:23Z',
  duration_sec: 1823,
  tokens_used: 48500,
  cost_usd: 1.45,
  pr_number: 101,
  pr_url: 'https://github.com/org/frontend/pull/101',
  branch: 'feat/improve-dashboard',
  commit_count: 3,
  files_changed: 7,
  timeline: [
    {
      timestamp: '2024-01-15T10:00:00Z',
      event_type: 'session_started',
      description: 'Session started',
    },
    {
      timestamp: '2024-01-15T10:15:00Z',
      event_type: 'commit',
      description: 'Committed 2 files',
    },
    {
      timestamp: '2024-01-15T10:30:23Z',
      event_type: 'pr_created',
      description: 'Pull request #101 created',
    },
  ],
}

export const mockCosts: CostResponse = {
  total_usd: 1842.5,
  breakdown: [
    { category: 'Claude Sonnet', amount_usd: 1105.5, percentage: 60 },
    { category: 'Claude Haiku', amount_usd: 553.0, percentage: 30 },
    { category: 'Claude Opus', amount_usd: 184.0, percentage: 10 },
  ],
  trend: [
    { month: '2024-10', amount_usd: 412.0 },
    { month: '2024-11', amount_usd: 589.0 },
    { month: '2024-12', amount_usd: 841.5 },
  ],
}

export const mockQuotas: QuotaItem[] = [
  { name: 'Monthly tokens', used: 48_320_000, limit: 100_000_000, unit: 'tokens' },
  { name: 'Monthly spend', used: 1842.5, limit: 5000, unit: 'USD' },
  { name: 'Concurrent sessions', used: 3, limit: 10, unit: 'sessions' },
]

export const mockTeam: TeamMemberStats[] = [
  {
    user: 'alice@example.com',
    display_name: 'Alice Smith',
    sessions: 312,
    tokens_used: 15_200_000,
    prs_merged: 278,
    success_rate: 0.89,
    avg_session_duration_sec: 1823,
    total_cost_usd: 612.4,
  },
  {
    user: 'bob@example.com',
    display_name: 'Bob Jones',
    sessions: 289,
    tokens_used: 14_800_000,
    prs_merged: 251,
    success_rate: 0.87,
    avg_session_duration_sec: 2100,
    total_cost_usd: 589.1,
  },
  {
    user: 'carol@example.com',
    display_name: 'Carol Lee',
    sessions: 201,
    tokens_used: 9_100_000,
    prs_merged: 174,
    success_rate: 0.86,
    avg_session_duration_sec: 1650,
    total_cost_usd: 381.0,
  },
]

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
