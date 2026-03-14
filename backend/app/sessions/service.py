"""Business logic for sessions module.

Provides filtering, cursor-based pagination, and detail lookup
over mock session data.
"""

from app.sessions import mock_data
from app.sessions.schemas import (
    PaginatedSessionsResponse,
    PaginationMeta,
    SessionDetail,
    SessionSummary,
    TimelineEvent,
)

_SUMMARY_FIELDS = frozenset(SessionSummary.model_fields.keys())


def list_sessions(
    *,
    status: str | None = None,
    repo: str | None = None,
    user: str | None = None,
    cursor: str | None = None,
    limit: int = 20,
) -> PaginatedSessionsResponse:
    """Return a paginated, filtered list of session summaries.

    Cursor is the session_id of the last item on the previous page.
    """
    all_sessions = mock_data.SESSIONS

    # Filter
    filtered = [
        s
        for s in all_sessions
        if (status is None or s["status"] == status)
        and (repo is None or s["repo"] == repo)
        and (user is None or s["user"] == user)
    ]

    # Find cursor offset
    start_index = 0
    if cursor is not None:
        found = False
        for i, s in enumerate(filtered):
            if s["session_id"] == cursor:
                start_index = i + 1
                found = True
                break
        if not found:
            raise ValueError(f"Invalid cursor '{cursor}'")

    page = filtered[start_index : start_index + limit]
    has_more = start_index + limit < len(filtered)
    next_cursor = page[-1]["session_id"] if has_more and page else None

    # prev_cursor points to the cursor needed to fetch the previous page.
    # cursor=X means "start after X", so prev page's cursor is the item
    # just before the previous page's first element.
    # If the previous page is page 1 (start_index <= limit), no cursor
    # is needed — we use a special empty string so the frontend can still
    # detect "there IS a previous page" and reset to cursor=undefined.
    if start_index <= 0:
        prev_cursor = None
    elif start_index <= limit:
        # Previous page is the first page
        prev_cursor = ""
    else:
        prev_cursor = filtered[start_index - limit - 1]["session_id"]

    summaries = [
        SessionSummary(**{k: v for k, v in s.items() if k in _SUMMARY_FIELDS})
        for s in page
    ]

    return PaginatedSessionsResponse(
        data=summaries,
        pagination=PaginationMeta(
            next_cursor=next_cursor,
            prev_cursor=prev_cursor,
            has_more=has_more,
            limit=limit,
            approx_total=len(filtered),
        ),
    )


def get_session(session_id: str) -> SessionDetail | None:
    """Return full session detail by ID, or None if not found."""
    for s in mock_data.SESSIONS:
        if s["session_id"] == session_id:
            return SessionDetail(
                session_id=s["session_id"],
                repo=s["repo"],
                user=s["user"],
                status=s["status"],
                started_at=s["started_at"],
                finished_at=s["finished_at"],
                duration_sec=s["duration_sec"],
                tokens_used=s["tokens_used"],
                cost_usd=s["cost_usd"],
                pr_number=s["pr_number"],
                pr_url=s["pr_url"],
                branch=s["branch"],
                commit_count=s["commit_count"],
                files_changed=s["files_changed"],
                timeline=[TimelineEvent(**e) for e in s["timeline"]],
            )
    return None
