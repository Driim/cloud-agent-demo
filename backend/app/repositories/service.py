"""Business logic for repositories module."""

from app.repositories import mock_data
from app.repositories.schemas import RepositoryStats


def get_repositories() -> list[RepositoryStats]:
    """Return per-repository aggregated statistics."""
    return [RepositoryStats(**r) for r in mock_data.REPOSITORIES]
