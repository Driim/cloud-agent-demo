import { useParams, Link, Navigate } from 'react-router'
import { Flex, Grid, Metric, Text, Title } from '@tremor/react'
import DashboardCard from '../components/shared/DashboardCard'
import { useSession } from '../api/sessions'
import StatusBadge from '../components/shared/StatusBadge'
import SessionTimeline from '../components/sessions/SessionTimeline'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { formatDuration, formatUSD } from '../utils/format'
import { sanitizeApiError } from '../utils/errors'

const ALLOWED_PR_HOSTNAMES = ['github.com', 'gitlab.com', 'bitbucket.org']

function isAllowedPrUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    return (
      protocol === 'https:' &&
      ALLOWED_PR_HOSTNAMES.some((h) => hostname === h || hostname.endsWith(`.${h}`))
    )
  } catch {
    return false
  }
}

function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const session = useSession(id ?? '')

  if (!id) {
    return <Navigate to="/sessions" replace />
  }

  if (session.isLoading) {
    return <LoadingSkeleton lines={8} />
  }

  if (session.error) {
    return (
      <ErrorState
        message={sanitizeApiError(session.error)}
        onRetry={() => { void session.refetch() }}
      />
    )
  }

  if (!session.data) {
    return null
  }

  const s = session.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/sessions"
          className="text-sm text-ai-orange hover:text-orange-400"
        >
          &larr; Back
        </Link>
        <Title className="text-white">Session {s.session_id.slice(0, 12)}...</Title>
        <StatusBadge status={s.status} />
      </div>

      <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
        <DashboardCard>
          <Text className="text-neutral-400">Repository</Text>
          <Metric className="text-lg text-white">{s.repo}</Metric>
        </DashboardCard>
        <DashboardCard>
          <Text className="text-neutral-400">User</Text>
          <Metric className="text-lg text-white">{s.user}</Metric>
        </DashboardCard>
        <DashboardCard>
          <Text className="text-neutral-400">Duration</Text>
          <Metric className="text-lg text-white font-mono">{formatDuration(s.duration_sec)}</Metric>
        </DashboardCard>
        <DashboardCard>
          <Text className="text-neutral-400">Cost</Text>
          <Metric className="text-lg text-white font-mono">{formatUSD(s.cost_usd)}</Metric>
        </DashboardCard>
      </Grid>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <DashboardCard>
          <Title className="text-white">Details</Title>
          <div className="mt-4 space-y-2 text-sm">
            <Flex>
              <Text className="text-neutral-400">Branch</Text>
              <Text className="font-mono text-ai-purple">{s.branch}</Text>
            </Flex>
            <Flex>
              <Text className="text-neutral-400">Commits</Text>
              <Text className="text-neutral-300 font-mono">{s.commit_count}</Text>
            </Flex>
            <Flex>
              <Text className="text-neutral-400">Files Changed</Text>
              <Text className="text-neutral-300 font-mono">{s.files_changed}</Text>
            </Flex>
            <Flex>
              <Text className="text-neutral-400">Tokens Used</Text>
              <Text className="text-neutral-300 font-mono">{s.tokens_used.toLocaleString()}</Text>
            </Flex>
            {s.pr_url && isAllowedPrUrl(s.pr_url) && (
              <Flex>
                <Text className="text-neutral-400">Pull Request</Text>
                <a
                  href={s.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ai-orange hover:underline"
                >
                  #{s.pr_number}
                </a>
              </Flex>
            )}
            <Flex>
              <Text className="text-neutral-400">Started</Text>
              <Text className="text-neutral-300">{new Date(s.started_at).toLocaleString()}</Text>
            </Flex>
            {s.finished_at && (
              <Flex>
                <Text className="text-neutral-400">Finished</Text>
                <Text className="text-neutral-300">{new Date(s.finished_at).toLocaleString()}</Text>
              </Flex>
            )}
          </div>
        </DashboardCard>

        <SessionTimeline events={s.timeline} />
      </Grid>
    </div>
  )
}

export default SessionDetailPage
