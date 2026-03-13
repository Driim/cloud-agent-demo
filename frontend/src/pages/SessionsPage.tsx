import { useState } from 'react'
import { Grid, Title } from '@tremor/react'
import { useSessions } from '../api/sessions'
import { useErrors, useTimeseries, useDurationDistribution, useQuotas } from '../api/analytics'
import SessionsTable from '../components/sessions/SessionsTable'
import SessionFilters from '../components/sessions/SessionFilters'
import ErrorBreakdown from '../components/sessions/ErrorBreakdown'
import DurationDistribution from '../components/sessions/DurationDistribution'
import LatencyP95Chart from '../components/sessions/LatencyP95Chart'
import ConcurrentSessions from '../components/sessions/ConcurrentSessions'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { sanitizeApiError } from '../utils/errors'
import type { SessionStatus } from '../types/api'

function SessionsPage() {
  const [status, setStatus] = useState<SessionStatus | undefined>()
  const [cursor, setCursor] = useState<string | undefined>()

  const sessions = useSessions({ status, cursor, limit: 20 })
  const errors = useErrors()
  const latencyP95 = useTimeseries('latency_p95')
  const durationDist = useDurationDistribution()
  const quotas = useQuotas()

  if (sessions.isLoading) {
    return <LoadingSkeleton lines={8} />
  }

  if (sessions.error) {
    return (
      <ErrorState
        message={sanitizeApiError(sessions.error)}
        onRetry={() => {
          void sessions.refetch()
          void errors.refetch()
        }}
      />
    )
  }

  if (!sessions.data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>Agent Sessions</Title>
        <SessionFilters status={status} onStatusChange={(s) => { setStatus(s); setCursor(undefined) }} />
      </div>

      {quotas.data && <ConcurrentSessions data={quotas.data} />}

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        {durationDist.data && <DurationDistribution data={durationDist.data} />}
        {latencyP95.data && <LatencyP95Chart data={latencyP95.data} />}
      </Grid>

      {errors.data && <ErrorBreakdown data={errors.data} />}

      <SessionsTable
        data={sessions.data.data}
        pagination={sessions.data.pagination}
        onNextPage={() => {
          if (sessions.data.pagination.next_cursor) {
            setCursor(sessions.data.pagination.next_cursor)
          }
        }}
        onPrevPage={() => {
          if (sessions.data.pagination.prev_cursor) {
            setCursor(sessions.data.pagination.prev_cursor)
          }
        }}
      />
    </div>
  )
}

export default SessionsPage
