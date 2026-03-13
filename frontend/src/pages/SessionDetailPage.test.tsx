import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { SessionDetail } from '../types/api'
import SessionDetailPage from './SessionDetailPage'

// ── Module mocks ─────────────────────────────────────────────────────────────

let mockId: string | undefined = 'sess-test-123'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useParams: () => ({ id: mockId }),
    // Replace Link with plain <a> to avoid router context requirement
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={String(to)}>{children}</a>
    ),
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  }
})

vi.mock('../api/sessions', () => ({
  useSession: vi.fn(),
}))

// SessionTimeline has its own deps; keep it out of scope for these tests
vi.mock('../components/sessions/SessionTimeline', () => ({
  default: () => null,
}))

import { useSession } from '../api/sessions'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<SessionDetail> = {}): SessionDetail {
  return {
    session_id: 'sess-test-123',
    repo: 'org/repo',
    user: 'alice',
    status: 'completed',
    started_at: '2025-03-01T10:00:00Z',
    finished_at: '2025-03-01T10:05:00Z',
    duration_sec: 300,
    tokens_used: 5000,
    cost_usd: 0.15,
    pr_number: 42,
    pr_url: 'https://github.com/org/repo/pull/42',
    branch: 'feat/test',
    commit_count: 2,
    files_changed: 4,
    timeline: [],
    ...overrides,
  }
}

function mockSessionQuery(overrides: { isLoading?: boolean; error?: Error | null; data?: SessionDetail | null } = {}) {
  vi.mocked(useSession).mockReturnValue({
    isLoading: false,
    error: null,
    data: makeSession(),
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useSession>)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockId = 'sess-test-123'
})

describe('SessionDetailPage — redirect when id is missing', () => {
  it('redirects to /sessions when id is undefined', () => {
    mockId = undefined
    mockSessionQuery()
    render(<SessionDetailPage />)
    const nav = screen.getByTestId('navigate')
    expect(nav).toHaveAttribute('data-to', '/sessions')
  })
})

describe('SessionDetailPage — loading / error states', () => {
  it('renders loading skeleton while fetching', () => {
    mockSessionQuery({ isLoading: true, data: undefined })
    const { container } = render(<SessionDetailPage />)
    // LoadingSkeleton renders placeholder divs — component must not throw
    expect(container).toBeTruthy()
  })

  it('renders error state on fetch failure', () => {
    mockSessionQuery({ error: new Error('Server error details') })
    render(<SessionDetailPage />)
    // ErrorState is rendered — retry button should be present
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('renders nothing when data is null', () => {
    mockSessionQuery({ data: null as unknown as SessionDetail })
    const { container } = render(<SessionDetailPage />)
    expect(container.firstChild).toBeNull()
  })
})

describe('SessionDetailPage — pr_url validation', () => {
  it('renders PR link for a valid GitHub URL', () => {
    mockSessionQuery({ data: makeSession({ pr_url: 'https://github.com/org/repo/pull/42', pr_number: 42 }) })
    render(<SessionDetailPage />)
    const link = screen.getByRole('link', { name: /#42/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://github.com/org/repo/pull/42')
  })

  it('renders PR link for a valid GitLab URL', () => {
    mockSessionQuery({ data: makeSession({ pr_url: 'https://gitlab.com/org/repo/merge_requests/7', pr_number: 7 }) })
    render(<SessionDetailPage />)
    expect(screen.getByRole('link', { name: /#7/i })).toBeInTheDocument()
  })

  it('renders PR link for a valid Bitbucket URL', () => {
    mockSessionQuery({ data: makeSession({ pr_url: 'https://bitbucket.org/org/repo/pull-requests/5', pr_number: 5 }) })
    render(<SessionDetailPage />)
    expect(screen.getByRole('link', { name: /#5/i })).toBeInTheDocument()
  })

  it('does NOT render PR link for an HTTP (non-HTTPS) URL', () => {
    mockSessionQuery({ data: makeSession({ pr_url: 'http://github.com/org/repo/pull/42', pr_number: 42 }) })
    render(<SessionDetailPage />)
    expect(screen.queryByRole('link', { name: /#42/i })).not.toBeInTheDocument()
  })

  it('does NOT render PR link for an unknown domain', () => {
    mockSessionQuery({ data: makeSession({ pr_url: 'https://evil.com/fake/pull/42', pr_number: 42 }) })
    render(<SessionDetailPage />)
    expect(screen.queryByRole('link', { name: /#42/i })).not.toBeInTheDocument()
  })

  it('does NOT render PR link for a subdomain injection attempt', () => {
    // e.g. https://github.com.evil.com/...
    mockSessionQuery({ data: makeSession({ pr_url: 'https://github.com.evil.com/org/repo/pull/42', pr_number: 42 }) })
    render(<SessionDetailPage />)
    expect(screen.queryByRole('link', { name: /#42/i })).not.toBeInTheDocument()
  })

  it('does NOT render PR link for a malformed URL string', () => {
    mockSessionQuery({ data: makeSession({ pr_url: 'not-a-url', pr_number: 42 }) })
    render(<SessionDetailPage />)
    expect(screen.queryByRole('link', { name: /#42/i })).not.toBeInTheDocument()
  })

  it('does NOT render the PR row when pr_url is null', () => {
    mockSessionQuery({ data: makeSession({ pr_url: null, pr_number: null }) })
    render(<SessionDetailPage />)
    expect(screen.queryByText('Pull Request')).not.toBeInTheDocument()
  })
})
