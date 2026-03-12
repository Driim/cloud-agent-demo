"""Pydantic schemas for repositories module."""

from pydantic import AwareDatetime, BaseModel


class RepositoryStats(BaseModel):
    """Aggregated statistics for a single repository."""

    repo: str
    sessions: int
    tokens_used: int
    prs_merged: int
    success_rate: float
    total_cost_usd: float
    top_contributor: str
    last_session_at: AwareDatetime
