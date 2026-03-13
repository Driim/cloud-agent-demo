import { useState } from 'react'
import { Title } from '@tremor/react'
import { useSessions } from '../api/sessions'
import { useErrors } from '../api/analytics'
import SessionsTable from '../components/sessions/SessionsTable'
import SessionFilters from '../components/sessions/SessionFilters'
import ErrorBreakdown from '../components/sessions/ErrorBreakdown'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { sanitizeApiError } from '../utils/errors'
import type { SessionStatus } from '../types/api'

function SessionsPage() {
  const [status, setStatus] = useState<SessionStatus | undefined>()
  const [cursor, setCursor] = useState<string | undefined>()

  const sessions = useSessions({ status, cursor, limit: 20 })
  const errors = useErrors()

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
