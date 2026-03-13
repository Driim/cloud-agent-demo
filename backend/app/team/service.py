"""Business logic for team module.

Provides team member stats and activity event streaming.
"""

import asyncio
import json
import random
import uuid
from collections.abc import AsyncGenerator
from datetime import datetime, timezone

from app.team import mock_data
from app.team.schemas import ActivityEvent, TeamMemberStats

_EVENT_TYPES = [
    "session_started",
    "session_completed",
    "pr_merged",
    "session_failed",
]

# Weighted towards successful outcomes
_EVENT_WEIGHTS = [0.30, 0.35, 0.25, 0.10]

_STARTED_TEMPLATES = [
    "{name} started a session on {repo}",
    "{name} kicked off an agent session in {repo}",
    "{name} launched a coding session on {repo}",
    "{name} began working on {repo}",
]

_COMPLETED_TEMPLATES = [
    "{name} completed a session on {repo} ({files} files changed)",
    "{name} finished a {duration}min session on {repo}",
    "{name} wrapped up work on {repo} — {commits} commits pushed",
    "{name} completed a session on {repo} using {tokens}k tokens",
]

_PR_TEMPLATES = [
    "{name} merged PR #{pr} on {repo}",
    "{name} merged \"{branch}\" into main on {repo}",
    "{name} landed PR #{pr} on {repo} (+{additions}/-{deletions})",
    "{name} merged PR #{pr} on {repo} — {reviewers} approvals",
]

_FAILED_TEMPLATES = [
    "{name}'s session failed on {repo}: {reason}",
    "{name} hit an error on {repo} — {reason}",
    "Session failed for {name} on {repo}: {reason}",
]

_FAILURE_REASONS = [
    "sandbox timeout",
    "context window exceeded",
    "tool call failed",
    "rate limit hit",
    "build failed",
    "test suite failed",
    "dependency conflict",
    "permission denied",
]

_BRANCH_PREFIXES = ["feat", "fix", "refactor", "chore", "perf", "docs"]
_BRANCH_NAMES = [
    "add-auth", "memory-leak", "dashboard-v2", "deps-update",
    "api-pagination", "timeout-handling", "sse-events", "db-layer",
    "dark-mode", "race-condition", "user-roles", "cache-invalidation",
    "error-boundaries", "rate-limiter", "webhook-retry", "schema-migration",
]


def get_team_stats() -> list[TeamMemberStats]:
    """Return per-member statistics for the organisation."""
    return [TeamMemberStats(**m) for m in mock_data.TEAM_MEMBERS]


def _generate_event() -> ActivityEvent:
    """Generate a single random activity event with the current timestamp."""
    event_type = random.choices(_EVENT_TYPES, weights=_EVENT_WEIGHTS, k=1)[0]
    member = random.choice(mock_data.TEAM_MEMBERS)
    repo = random.choice(mock_data.REPOS)
    user = member["user"]
    name = member["display_name"].split()[0]

    pr_num = random.randint(100, 999)
    branch = f"{random.choice(_BRANCH_PREFIXES)}/{random.choice(_BRANCH_NAMES)}"

    fill = {
        "name": name,
        "repo": repo,
        "pr": pr_num,
        "branch": branch,
        "files": random.randint(1, 24),
        "commits": random.randint(1, 12),
        "tokens": random.randint(8, 95),
        "duration": random.randint(3, 45),
        "additions": random.randint(10, 800),
        "deletions": random.randint(2, 300),
        "reviewers": random.randint(1, 4),
        "reason": random.choice(_FAILURE_REASONS),
    }

    templates = {
        "session_started": _STARTED_TEMPLATES,
        "session_completed": _COMPLETED_TEMPLATES,
        "pr_merged": _PR_TEMPLATES,
        "session_failed": _FAILED_TEMPLATES,
    }

    description = random.choice(templates[event_type]).format(**fill)

    return ActivityEvent(
        event_id=f"evt_{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc),
        event_type=event_type,
        user=user,
        repo=repo,
        description=description,
    )


async def stream_activity_feed() -> AsyncGenerator[dict, None]:
    """Yield randomly generated activity events as SSE-compatible dicts.

    Sends one event every 2-5 seconds with a current timestamp,
    so the frontend feed looks alive when a client connects.
    """
    while True:
        event = _generate_event()
        yield {
            "data": json.dumps(event.model_dump(mode="json")),
        }
        await asyncio.sleep(random.uniform(2, 5))
