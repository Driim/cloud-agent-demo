import { Card, Title } from '@tremor/react'
import type { TimelineEvent } from '../../types/api'

interface SessionTimelineProps {
  readonly events: readonly TimelineEvent[]
}

function SessionTimeline({ events }: SessionTimelineProps) {
  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl !ring-0">
      <Title className="text-white">Timeline</Title>
      <div className="mt-4 space-y-3">
        {events.map((event, i) => {
          const time = new Date(event.timestamp).toLocaleTimeString()
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-ai-blue mt-1.5" />
                {i < events.length - 1 && (
                  <div className="w-px flex-1 bg-white/10" />
                )}
              </div>
              <div className="pb-3">
                <p className="text-sm font-medium text-white">
                  {event.event_type}
                </p>
                <p className="text-sm text-neutral-400">{event.description}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default SessionTimeline
