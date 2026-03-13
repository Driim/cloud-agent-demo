import { useParams, Link, Navigate } from 'react-router'
import { Card, Flex, Grid, Metric, Text, Title } from '@tremor/react'
import { useSession } from '../api/sessions'
import StatusBadge from '../components/shared/StatusBadge'
import SessionTimeline from '../components/sessions/SessionTimeline'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { formatDuration } from '../utils/format'
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

  if (!id) {
    return <Navigate to="/sessions" replace />
  }

  const session = useSession(id)

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
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back
        </Link>
        <Title>Session {s.session_id.slice(0, 12)}...</Title>
        <StatusBadge status={s.status} />
      </div>

      <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
        <Card>
          <Text>Repository</Text>
          <Metric className="text-lg">{s.repo}</Metric>
        </Card>
        <Card>
          <Text>User</Text>
          <Metric className="text-lg">{s.user}</Metric>
        </Card>
        <Card>
          <Text>Duration</Text>
          <Metric className="text-lg">{formatDuration(s.duration_sec)}</Metric>
        </Card>
        <Card>
          <Text>Cost</Text>
          <Metric className="text-lg">${s.cost_usd.toFixed(2)}</Metric>
        </Card>
      </Grid>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Details</Title>
          <div className="mt-4 space-y-2 text-sm">
            <Flex>
              <Text>Branch</Text>
              <Text className="font-mono">{s.branch}</Text>
            </Flex>
            <Flex>
              <Text>Commits</Text>
              <Text>{s.commit_count}</Text>
            </Flex>
            <Flex>
              <Text>Files Changed</Text>
              <Text>{s.files_changed}</Text>
            </Flex>
            <Flex>
              <Text>Tokens Used</Text>
              <Text>{s.tokens_used.toLocaleString()}</Text>
            </Flex>
            {s.pr_url && isAllowedPrUrl(s.pr_url) && (
              <Flex>
                <Text>Pull Request</Text>
                <a
                  href={s.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  #{s.pr_number}
                </a>
              </Flex>
            )}
            <Flex>
              <Text>Started</Text>
              <Text>{new Date(s.started_at).toLocaleString()}</Text>
            </Flex>
            <Flex>
              <Text>Finished</Text>
              <Text>{new Date(s.finished_at).toLocaleString()}</Text>
            </Flex>
          </div>
        </Card>

        <SessionTimeline events={s.timeline} />
      </Grid>
    </div>
  )
}

export default SessionDetailPage
