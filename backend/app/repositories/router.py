"""Repositories router: per-repo aggregated statistics."""

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.auth.schemas import UserProfile
from app.repositories import service
from app.repositories.schemas import RepositoryStats

router = APIRouter(prefix="/analytics/repositories", tags=["repositories"])


@router.get("", response_model=list[RepositoryStats])
async def get_repositories(
    _: UserProfile = Depends(get_current_user),
) -> list[RepositoryStats]:
    """Return per-repository aggregated statistics."""
    return service.get_repositories()
