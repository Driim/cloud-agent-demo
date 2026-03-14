import { Badge, Title } from '@tremor/react'
import DashboardCard from '../shared/DashboardCard'
import UserAvatar from '../shared/UserAvatar'
import { useSSE } from '../../hooks/useSSE'
import { BASE_URL, getAuthToken } from '../../api/client'
import type { ActivityEvent } from '../../types/api'

const EVENT_COLORS: Record<string, string> = {
  session_started: 'orange',
  session_completed: 'green',
  pr_merged: 'emerald',
  session_failed: 'red',
}

function ActivityFeed() {
  const { events, isConnected, error } = useSSE<ActivityEvent>({
    url: `${BASE_URL}/analytics/team/feed`,
    token: getAuthToken,
    maxEvents: 30,
  })

  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <Title className="text-white">Activity Feed</Title>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-neutral-600'}`}
          />
          <span className="text-xs text-neutral-400">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 && (
          <p className="text-sm text-neutral-500">Waiting for events...</p>
        )}
        {events.map((event) => {
          const time = new Date(event.timestamp).toLocaleTimeString()
          const color = EVENT_COLORS[event.event_type] ?? 'gray'
          return (
            <div key={event.event_id} className="flex items-start gap-3">
              <UserAvatar name={event.user} size="sm" />
              <Badge color={color} size="xs" className="mt-0.5 shrink-0">
                {event.event_type.replace(/_/g, ' ')}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-300 truncate">
                  <span className="font-medium text-white">{event.user}</span>
                  {' · '}
                  {event.repo}
                </p>
                <p className="text-xs text-neutral-500">{event.description}</p>
              </div>
              <span className="text-xs text-neutral-500 shrink-0">{time}</span>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}

export default ActivityFeed
