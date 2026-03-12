"""Business logic for team module.

Provides team member stats and activity event streaming.
"""

import asyncio
import json
from collections.abc import AsyncGenerator

from app.team import mock_data
from app.team.schemas import ActivityEvent, TeamMemberStats


def get_team_stats() -> list[TeamMemberStats]:
    """Return per-member statistics for the organisation."""
    return [TeamMemberStats(**m) for m in mock_data.TEAM_MEMBERS]


async def stream_activity_feed() -> AsyncGenerator[dict, None]:
    """Yield activity events as SSE-compatible dicts, cycling indefinitely.

    Sends one event every 3 seconds. The generator cycles through mock
    events and yields a keepalive comment every full cycle.
    """
    events = mock_data.ACTIVITY_EVENTS
    idx = 0
    while True:
        raw = events[idx % len(events)]
        event = ActivityEvent(**raw)
        yield {
            "event": event.event_type,
            "data": json.dumps(event.model_dump(mode="json")),
        }
        idx += 1
        if idx % len(events) == 0:
            yield {"comment": "keepalive"}
        await asyncio.sleep(3)
