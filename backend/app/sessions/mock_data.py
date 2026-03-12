"""Static mock fixtures for sessions module.

~50 sessions with varied statuses, repos, users, and durations.
All data is deterministic — no random module used.
"""

from datetime import datetime, timedelta, timezone
from typing import Final

_BASE_DT = datetime(2026, 3, 12, 10, 0, 0, tzinfo=timezone.utc)

_REPOS: Final[list[str]] = [
    "acme-corp/backend-api",
    "acme-corp/frontend-app",
    "acme-corp/data-pipeline",
    "acme-corp/infra-terraform",
    "acme-corp/mobile-sdk",
]

_USERS: Final[list[str]] = [
    "alice@acme-corp.io",
    "bob@acme-corp.io",
    "carol@acme-corp.io",
    "dave@acme-corp.io",
]

_STATUSES: Final[list[str]] = [
    "completed",
    "merged",
    "completed",
    "merged",
    "failed",
    "merged",
    "completed",
    "timed_out",
    "merged",
    "completed",
]

_BRANCHES: Final[list[str]] = [
    "feat/add-auth",
    "fix/memory-leak",
    "feat/dashboard-v2",
    "chore/deps-update",
    "feat/api-pagination",
    "fix/timeout-handling",
    "feat/sse-events",
    "refactor/db-layer",
    "feat/dark-mode",
    "fix/race-condition",
]


def _build_timeline(
    session_id: str, status: str, started_at: datetime, duration_sec: int
) -> list[dict]:
    """Build a deterministic timeline for a session."""
    events: list[dict] = [
        {
            "timestamp": started_at.isoformat(),
            "event_type": "session_started",
            "description": f"Session {session_id} started",
        },
    ]
    mid = started_at + timedelta(seconds=duration_sec // 3)
    events.append(
        {
            "timestamp": mid.isoformat(),
            "event_type": "tool_call",
            "description": "Agent executed code analysis",
        }
    )
    end = started_at + timedelta(seconds=duration_sec)
    if status == "failed":
        events.append(
            {
                "timestamp": end.isoformat(),
                "event_type": "error",
                "description": "Session failed: sandbox timeout",
            }
        )
    elif status == "timed_out":
        events.append(
            {
                "timestamp": end.isoformat(),
                "event_type": "timeout",
                "description": "Session exceeded maximum duration",
            }
        )
    else:
        events.append(
            {
                "timestamp": end.isoformat(),
                "event_type": "session_completed",
                "description": f"Session {session_id} completed successfully",
            }
        )
    return events


def _generate_sessions() -> list[dict]:
    """Generate ~50 deterministic sessions."""
    sessions: list[dict] = []
    for i in range(50):
        idx = i + 1
        session_id = f"sess_{idx:03d}"
        status = _STATUSES[i % len(_STATUSES)]
        repo = _REPOS[i % len(_REPOS)]
        user = _USERS[i % len(_USERS)]
        branch = _BRANCHES[i % len(_BRANCHES)]

        # Spread sessions over the last 30 days
        started_at = _BASE_DT - timedelta(hours=i * 14, minutes=i * 7)
        duration_sec = 120 + (i * 37) % 1800
        finished_at = started_at + timedelta(seconds=duration_sec)
        tokens_used = 8_000 + (i * 1_237) % 45_000
        cost_usd = round(tokens_used * 0.00005, 2)
        pr_number = (100 + i) if status in ("merged", "completed") else None
        pr_url = f"https://github.com/{repo}/pull/{pr_number}" if pr_number else None

        sessions.append(
            {
                "session_id": session_id,
                "repo": repo,
                "user": user,
                "status": status,
                "started_at": started_at.isoformat(),
                "finished_at": finished_at.isoformat(),
                "duration_sec": duration_sec,
                "tokens_used": tokens_used,
                "cost_usd": cost_usd,
                "pr_number": pr_number,
                "pr_url": pr_url,
                "branch": branch,
                "commit_count": 1 + i % 8,
                "files_changed": 1 + i % 15,
                "timeline": _build_timeline(
                    session_id, status, started_at, duration_sec
                ),
            }
        )
    return sessions


SESSIONS: Final[list[dict]] = _generate_sessions()
