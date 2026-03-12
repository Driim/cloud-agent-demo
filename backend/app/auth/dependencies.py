"""FastAPI dependencies for auth module."""

from fastapi import Depends, Header, HTTPException, status

from app.auth.mock_data import MOCK_USER
from app.auth.schemas import UserProfile


def get_current_user(
    authorization: str | None = Header(default=None),
) -> UserProfile:
    """Validate the Authorization header and return the mock user.

    In production this will decode and verify the JWT. In mock mode
    any Bearer token is accepted, but the header must be present.
    """
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserProfile(**{k: v for k, v in MOCK_USER.items() if k != "password"})


def get_current_org(
    user: UserProfile = Depends(get_current_user),
) -> str:
    """Return the org_id of the current user."""
    return user.org_id
