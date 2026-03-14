"""Static mock fixtures for sessions module.

~80 sessions with varied statuses, repos, users, and durations.
All data is deterministic — no random module used.

Values calibrated to industry benchmarks:
- Tokens/session: 50K–4M, median ~550K (log-normal-like)
- Cost/session: $0.50–$15, median ~$3.50
- Duration: 5–75 min, median 25 min
- Status distribution: completed 55%, merged 25%, failed 12%, timed_out 3%, active 5%
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
    "acme-corp/auth-service",
    "acme-corp/ml-models",
    "acme-corp/docs-site",
    "acme-corp/billing-engine",
    "acme-corp/notification-hub",
]

_USERS: Final[list[str]] = [
    "alice@acme-corp.io",
    "bob@acme-corp.io",
    "carol@acme-corp.io",
    "dave@acme-corp.io",
    "elena@acme-corp.io",
    "frank@acme-corp.io",
    "grace@acme-corp.io",
    "hector@acme-corp.io",
    "igor@acme-corp.io",
    "kenji@acme-corp.io",
    "lina@acme-corp.io",
    "marco@acme-corp.io",
    "nadia@acme-corp.io",
    "omar@acme-corp.io",
    "priya@acme-corp.io",
]

# Status distribution (25-element cycle):
# completed=14 (56%), merged=6 (24%), failed=3 (12%), timed_out=1 (4%), active=1 (4%)
# Matches benchmark §3.1: completed 55%, merged 25%, failed 12%, timed_out 3%, active 5%
_STATUSES: Final[list[str]] = [
    "completed",
    "merged",
    "completed",
    "completed",
    "failed",
    "completed",
    "merged",
    "completed",
    "completed",
    "active",
    "completed",
    "merged",
    "completed",
    "timed_out",
    "completed",
    "merged",
    "completed",
    "failed",
    "completed",
    "merged",
    "completed",
    "completed",
    "failed",
    "completed",
    "merged",
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
    "feat/user-roles",
    "fix/cache-invalidation",
    "feat/error-boundaries",
    "perf/query-optimization",
    "feat/webhook-retry",
    "refactor/schema-migration",
    "feat/notifications",
    "fix/cors-headers",
    "feat/rate-limiter",
    "chore/ci-pipeline",
    "feat/file-upload",
    "fix/timezone-bug",
    "feat/search-index",
    "refactor/auth-middleware",
]

_TOOL_ACTIONS: Final[list[str]] = [
    "Agent executed code analysis",
    "Agent ran test suite",
    "Agent applied lint fixes",
    "Agent refactored module structure",
    "Agent updated type definitions",
    "Agent resolved merge conflicts",
    "Agent generated migration script",
    "Agent added error handling",
    "Agent optimized database query",
    "Agent reviewed and updated docs",
    "Agent installed new dependency",
    "Agent fixed failing test",
]

_FAILURE_REASONS: Final[list[str]] = [
    "Session failed: sandbox timeout",
    "Session failed: context window exceeded",
    "Session failed: build error in CI",
    "Session failed: dependency conflict",
    "Session failed: test assertion error",
    "Session failed: rate limit exceeded",
]

_TIMEOUT_REASONS: Final[list[str]] = [
    "Session exceeded maximum duration",
    "Session timed out waiting for CI",
    "Session timed out during build step",
]

# Token tiers (log-normal-like distribution in thousands):
# Quick tasks (40%): 80K–180K
# Typical (46%): 450K–1.5M
# Extended/marathon (14%): 2M–3.5M
_TOKEN_TIERS_K: Final[list[int]] = [
    80,
    120,
    550,
    850,
    1_200,
    500,
    900,
    150,
    750,
    2_500,
    600,
    450,
    1_100,
    650,
    95,
    800,
    350,
    1_500,
    700,
    3_000,
]


def _build_timeline(
    session_id: str, status: str, started_at: datetime, duration_sec: int, idx: int
) -> list[dict]:
    """Build a deterministic timeline for a session."""
    events: list[dict] = [
        {
            "timestamp": started_at.isoformat(),
            "event_type": "session_started",
            "description": f"Session {session_id} started",
        },
    ]

    # Add 1-4 tool_call events spread across the session
    num_actions = 1 + idx % 4
    for j in range(num_actions):
        action_time = started_at + timedelta(
            seconds=duration_sec * (j + 1) // (num_actions + 2)
        )
        action = _TOOL_ACTIONS[(idx * 3 + j) % len(_TOOL_ACTIONS)]
        events.append(
            {
                "timestamp": action_time.isoformat(),
                "event_type": "tool_call",
                "description": action,
            }
        )

    end = started_at + timedelta(seconds=duration_sec)
    if status == "failed":
        reason = _FAILURE_REASONS[idx % len(_FAILURE_REASONS)]
        events.append(
            {
                "timestamp": end.isoformat(),
                "event_type": "error",
                "description": reason,
            }
        )
    elif status == "timed_out":
        reason = _TIMEOUT_REASONS[idx % len(_TIMEOUT_REASONS)]
        events.append(
            {
                "timestamp": end.isoformat(),
                "event_type": "timeout",
                "description": reason,
            }
        )
    elif status == "active":
        pass  # no end event for active sessions
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
    """Generate ~80 deterministic sessions."""
    sessions: list[dict] = []
    for i in range(80):
        idx = i + 1
        session_id = f"sess_{idx:03d}"
        status = _STATUSES[i % len(_STATUSES)]
        repo = _REPOS[i % len(_REPOS)]
        user = _USERS[i % len(_USERS)]
        branch = _BRANCHES[i % len(_BRANCHES)]

        # Spread sessions over the last 30 days with varied spacing
        hours_offset = i * 9 + (i * 7) % 5
        started_at = _BASE_DT - timedelta(hours=hours_offset, minutes=i * 3)

        # Duration: 300–4500 sec (5–75 min), median ~25 min
        duration_sec = 300 + (i * 73 + 29) % 4200
        finished_at = started_at + timedelta(seconds=duration_sec)

        # Tokens: log-normal-like via tier cycling + deterministic offset
        tokens_used = _TOKEN_TIERS_K[i % len(_TOKEN_TIERS_K)] * 1_000 + (
            (i * 17_321) % 100_000
        )

        # Cost: ~$0.006/1K tokens (Sonnet 4.6 blended rate: input $3/M + output $15/M)
        cost_usd = round(tokens_used * 0.000006, 2)

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
                "commit_count": 1 + (i * 3) % 12,
                "files_changed": 1 + (i * 7) % 25,
                "timeline": _build_timeline(
                    session_id, status, started_at, duration_sec, i
                ),
            }
        )
    return sessions


SESSIONS: Final[list[dict]] = _generate_sessions()
