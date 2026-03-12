"""Sessions router: list with cursor pagination and detail view."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.dependencies import get_current_user
from app.auth.schemas import UserProfile
from app.sessions import service
from app.sessions.schemas import PaginatedSessionsResponse, SessionDetail

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=PaginatedSessionsResponse)
async def list_sessions(
    status_filter: str | None = Query(
        default=None, alias="status", description="Filter by status"
    ),
    repo: str | None = Query(default=None, description="Filter by repository"),
    user: str | None = Query(default=None, description="Filter by user email"),
    cursor: str | None = Query(
        default=None, description="Cursor (session_id) for pagination"
    ),
    limit: int = Query(default=20, ge=1, le=100, description="Page size"),
    _: UserProfile = Depends(get_current_user),
) -> PaginatedSessionsResponse:
    """Return a paginated list of agent sessions."""
    try:
        return service.list_sessions(
            status=status_filter,
            repo=repo,
            user=user,
            cursor=cursor,
            limit=limit,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


@router.get("/{session_id}", response_model=SessionDetail)
async def get_session(
    session_id: str,
    _: UserProfile = Depends(get_current_user),
) -> SessionDetail:
    """Return full detail for a single session."""
    result = service.get_session(session_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found",
        )
    return result
