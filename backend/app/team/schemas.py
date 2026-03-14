"""Pydantic schemas for team module."""

from typing import Literal

from pydantic import AwareDatetime, BaseModel

ActivityEventType = Literal[
    "session_started", "session_completed", "pr_merged", "session_failed"
]


class TeamMemberStats(BaseModel):
    """Per-member aggregated statistics."""

    user: str
    display_name: str
    sessions: int
    tokens_used: int
    prs_merged: int
    success_rate: float
    avg_session_duration_sec: int
    total_cost_usd: float


class ActivityEvent(BaseModel):
    """Single activity event for the team feed."""

    event_id: str
    timestamp: AwareDatetime
    event_type: ActivityEventType
    user: str
    repo: str
    description: str
