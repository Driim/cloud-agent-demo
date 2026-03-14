"""Static mock fixtures for team module.

Team member stats and pre-recorded activity events.
15-member team with role-based differentiation per benchmarks:

Role distribution: 2 Tech Leads, 3 Senior Devs, 5 Middle Devs, 5 Junior Devs

Sessions/week benchmarks (section 4.2):
- Tech Lead:  5-10/week  -> 21-43/month, 80-88% success
- Senior Dev: 8-15/week  -> 34-65/month, 78-85% success
- Middle Dev: 12-18/week -> 52-78/month, 70-78% success
- Junior Dev: 18-25/week -> 78-108/month, 55-65% success

Totals (must match analytics OVERVIEW):
- Sessions: 1,050
- Tokens: 547,500,000
- PRs merged: 262
- Cost: $2,580.00
"""

from datetime import datetime, timedelta, timezone
from typing import Final

_BASE_DT = datetime(2026, 3, 12, 10, 0, 0, tzinfo=timezone.utc)

TEAM_MEMBERS: Final[list[dict]] = [
    # ── Tech Leads (2) ────────────────────────────────────────────────
    {
        "user": "elena@acme-corp.io",
        "display_name": "Elena Petrova",
        "sessions": 35,
        "tokens_used": 23_800_000,
        "prs_merged": 9,
        "success_rate": 85.3,
        "avg_session_duration_sec": 2_100,
        "total_cost_usd": 112.20,
    },
    {
        "user": "igor@acme-corp.io",
        "display_name": "Igor Volkov",
        "sessions": 38,
        "tokens_used": 25_200_000,
        "prs_merged": 10,
        "success_rate": 83.8,
        "avg_session_duration_sec": 2_040,
        "total_cost_usd": 118.70,
    },
    # ── Senior Devs (3) ──────────────────────────────────────────────
    {
        "user": "alice@acme-corp.io",
        "display_name": "Alice Chen",
        "sessions": 52,
        "tokens_used": 32_240_000,
        "prs_merged": 13,
        "success_rate": 82.4,
        "avg_session_duration_sec": 1_680,
        "total_cost_usd": 151.90,
    },
    {
        "user": "grace@acme-corp.io",
        "display_name": "Grace Yamamoto",
        "sessions": 48,
        "tokens_used": 28_800_000,
        "prs_merged": 12,
        "success_rate": 80.4,
        "avg_session_duration_sec": 1_680,
        "total_cost_usd": 135.70,
    },
    {
        "user": "kenji@acme-corp.io",
        "display_name": "Kenji Tanaka",
        "sessions": 55,
        "tokens_used": 35_150_000,
        "prs_merged": 14,
        "success_rate": 79.8,
        "avg_session_duration_sec": 1_620,
        "total_cost_usd": 165.60,
    },
    # ── Middle Devs (5) ──────────────────────────────────────────────
    {
        "user": "bob@acme-corp.io",
        "display_name": "Bob Martinez",
        "sessions": 68,
        "tokens_used": 36_540_000,
        "prs_merged": 17,
        "success_rate": 74.2,
        "avg_session_duration_sec": 1_500,
        "total_cost_usd": 172.20,
    },
    {
        "user": "carol@acme-corp.io",
        "display_name": "Carol Singh",
        "sessions": 72,
        "tokens_used": 37_440_000,
        "prs_merged": 18,
        "success_rate": 76.1,
        "avg_session_duration_sec": 1_500,
        "total_cost_usd": 176.40,
    },
    {
        "user": "frank@acme-corp.io",
        "display_name": "Frank O'Brien",
        "sessions": 63,
        "tokens_used": 32_130_000,
        "prs_merged": 16,
        "success_rate": 72.7,
        "avg_session_duration_sec": 1_500,
        "total_cost_usd": 151.40,
    },
    {
        "user": "lina@acme-corp.io",
        "display_name": "Lina M\u00fcller",
        "sessions": 66,
        "tokens_used": 34_650_000,
        "prs_merged": 17,
        "success_rate": 75.4,
        "avg_session_duration_sec": 1_440,
        "total_cost_usd": 163.30,
    },
    {
        "user": "marco@acme-corp.io",
        "display_name": "Marco Rossi",
        "sessions": 60,
        "tokens_used": 30_900_000,
        "prs_merged": 15,
        "success_rate": 73.5,
        "avg_session_duration_sec": 1_500,
        "total_cost_usd": 145.60,
    },
    # ── Junior Devs (5) ──────────────────────────────────────────────
    {
        "user": "dave@acme-corp.io",
        "display_name": "Dave Kim",
        "sessions": 98,
        "tokens_used": 46_560_000,
        "prs_merged": 24,
        "success_rate": 62.4,
        "avg_session_duration_sec": 1_080,
        "total_cost_usd": 219.40,
    },
    {
        "user": "hector@acme-corp.io",
        "display_name": "Hector Ruiz",
        "sessions": 105,
        "tokens_used": 48_300_000,
        "prs_merged": 26,
        "success_rate": 58.1,
        "avg_session_duration_sec": 1_080,
        "total_cost_usd": 227.60,
    },
    {
        "user": "nadia@acme-corp.io",
        "display_name": "Nadia Okafor",
        "sessions": 93,
        "tokens_used": 43_245_000,
        "prs_merged": 23,
        "success_rate": 61.7,
        "avg_session_duration_sec": 1_140,
        "total_cost_usd": 203.80,
    },
    {
        "user": "omar@acme-corp.io",
        "display_name": "Omar Hassan",
        "sessions": 100,
        "tokens_used": 46_470_000,
        "prs_merged": 24,
        "success_rate": 59.3,
        "avg_session_duration_sec": 1_020,
        "total_cost_usd": 219.00,
    },
    {
        "user": "priya@acme-corp.io",
        "display_name": "Priya Sharma",
        "sessions": 97,
        "tokens_used": 46_075_000,
        "prs_merged": 24,
        "success_rate": 63.5,
        "avg_session_duration_sec": 1_080,
        "total_cost_usd": 217.20,
    },
]

REPOS: Final[list[str]] = [
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

# Event type distribution (20-element cycle):
# session_started 6 (30%), session_completed 7 (35%),
# pr_merged 5 (25%), session_failed 2 (10%)
# Matches ActivityEventType Literal in team/schemas.py
_EVENT_TYPES: Final[list[str]] = [
    "session_started",
    "session_completed",
    "pr_merged",
    "session_started",
    "session_completed",
    "session_started",
    "pr_merged",
    "session_completed",
    "session_failed",
    "session_started",
    "session_completed",
    "pr_merged",
    "session_started",
    "session_completed",
    "pr_merged",
    "session_completed",
    "session_started",
    "session_completed",
    "pr_merged",
    "session_failed",
]

_USERS: Final[list[str]] = [m["user"] for m in TEAM_MEMBERS]


def _generate_events() -> list[dict]:
    """Generate 30 pre-recorded activity events."""
    events: list[dict] = []
    for i in range(30):
        event_type = _EVENT_TYPES[i % len(_EVENT_TYPES)]
        user = _USERS[i % len(_USERS)]
        repo = REPOS[i % len(REPOS)]
        ts = _BASE_DT - timedelta(minutes=i * 12)

        name = user.split("@")[0]
        descriptions = {
            "session_started": f"{name} started a session on {repo}",
            "session_completed": f"{name} completed a session on {repo}",
            "pr_merged": f"{name} merged PR #{100 + i} on {repo}",
            "session_failed": f"{name}'s session failed on {repo}",
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
