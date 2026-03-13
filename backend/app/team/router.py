"""Team router: member stats and SSE activity feed."""

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from app.auth.dependencies import get_current_user, get_current_user_sse
from app.auth.schemas import UserProfile
from app.team import service
from app.team.schemas import TeamMemberStats

router = APIRouter(prefix="/analytics/team", tags=["team"])


@router.get("", response_model=list[TeamMemberStats])
async def get_team_stats(
    _: UserProfile = Depends(get_current_user),
) -> list[TeamMemberStats]:
    """Return per-member statistics for the organisation."""
    return service.get_team_stats()


@router.get("/feed")
async def get_team_feed(
    _: UserProfile = Depends(get_current_user_sse),
) -> EventSourceResponse:
    """Return an SSE stream of team activity events."""
    return EventSourceResponse(service.stream_activity_feed())
