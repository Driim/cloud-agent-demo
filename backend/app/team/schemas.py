"""Pydantic schemas for team module."""

from pydantic import AwareDatetime, BaseModel


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
    event_type: str  # session_started | session_completed | pr_merged | session_failed
    user: str
    repo: str
    description: str
