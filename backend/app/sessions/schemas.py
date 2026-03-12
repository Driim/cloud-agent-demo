"""Pydantic schemas for sessions module."""

from pydantic import AwareDatetime, BaseModel


class SessionSummary(BaseModel):
    """Summary of a single agent session for list views."""

    session_id: str
    repo: str
    user: str
    status: str  # completed | merged | failed | timed_out
    started_at: AwareDatetime
    duration_sec: int
    tokens_used: int
    cost_usd: float
    pr_number: int | None = None


class TimelineEvent(BaseModel):
    """Single event in a session timeline."""

    timestamp: AwareDatetime
    event_type: str
    description: str


class SessionDetail(BaseModel):
    """Full detail for a single session."""

    session_id: str
    repo: str
    user: str
    status: str
    started_at: AwareDatetime
    finished_at: AwareDatetime
    duration_sec: int
    tokens_used: int
    cost_usd: float
    pr_number: int | None = None
    pr_url: str | None = None
    branch: str
    commit_count: int
    files_changed: int
    timeline: list[TimelineEvent]


class PaginationMeta(BaseModel):
    """Cursor-based pagination metadata."""

    next_cursor: str | None
    prev_cursor: str | None
    has_more: bool
    limit: int
    approx_total: int


class PaginatedSessionsResponse(BaseModel):
    """Paginated list of session summaries."""

    data: list[SessionSummary]
    pagination: PaginationMeta
