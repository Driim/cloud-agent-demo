"""Static mock fixtures for team module.

Team member stats and pre-recorded activity events.
"""

from datetime import datetime, timedelta, timezone
from typing import Final

_BASE_DT = datetime(2026, 3, 12, 10, 0, 0, tzinfo=timezone.utc)

TEAM_MEMBERS: Final[list[dict]] = [
    {
        "user": "alice@acme-corp.io",
        "display_name": "Alice Chen",
        "sessions": 342,
        "tokens_used": 13_250_000,
        "prs_merged": 248,
        "success_rate": 91.2,
        "avg_session_duration_sec": 485,
        "total_cost_usd": 662.50,
    },
    {
        "user": "bob@acme-corp.io",
        "display_name": "Bob Martinez",
        "sessions": 298,
        "tokens_used": 11_480_000,
        "prs_merged": 215,
        "success_rate": 88.6,
        "avg_session_duration_sec": 520,
        "total_cost_usd": 574.00,
    },
    {
        "user": "carol@acme-corp.io",
        "display_name": "Carol Singh",
        "sessions": 356,
        "tokens_used": 14_120_000,
        "prs_merged": 262,
        "success_rate": 89.9,
        "avg_session_duration_sec": 440,
        "total_cost_usd": 706.00,
    },
    {
        "user": "dave@acme-corp.io",
        "display_name": "Dave Kim",
        "sessions": 251,
        "tokens_used": 9_462_500,
        "prs_merged": 167,
        "success_rate": 82.1,
        "avg_session_duration_sec": 610,
        "total_cost_usd": 473.13,
    },
]

_REPOS: Final[list[str]] = [
    "acme-corp/backend-api",
    "acme-corp/frontend-app",
    "acme-corp/data-pipeline",
    "acme-corp/infra-terraform",
    "acme-corp/mobile-sdk",
]

_EVENT_TYPES: Final[list[str]] = [
    "session_started",
    "session_completed",
    "pr_merged",
    "session_failed",
    "session_completed",
    "pr_merged",
    "session_started",
    "session_completed",
]

_USERS: Final[list[str]] = [m["user"] for m in TEAM_MEMBERS]


def _generate_events() -> list[dict]:
    """Generate 30 pre-recorded activity events."""
    events: list[dict] = []
    for i in range(30):
        event_type = _EVENT_TYPES[i % len(_EVENT_TYPES)]
        user = _USERS[i % len(_USERS)]
        repo = _REPOS[i % len(_REPOS)]
        ts = _BASE_DT - timedelta(minutes=i * 12)

        descriptions = {
            "session_started": f"{user.split('@')[0]} started a session on {repo}",
            "session_completed": f"{user.split('@')[0]} completed a session on {repo}",
            "pr_merged": f"{user.split('@')[0]} merged PR #{100 + i} on {repo}",
            "session_failed": f"{user.split('@')[0]}'s session failed on {repo}",
        }

        events.append(
            {
                "event_id": f"evt_{i + 1:03d}",
                "timestamp": ts.isoformat(),
                "event_type": event_type,
                "user": user,
                "repo": repo,
                "description": descriptions[event_type],
            }
        )
    return events


ACTIVITY_EVENTS: Final[list[dict]] = _generate_events()
