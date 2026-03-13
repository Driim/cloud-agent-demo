"""FastAPI dependencies for auth module."""

from fastapi import Depends, Header, HTTPException, Query, status

from app.auth.mock_data import MOCK_USER
from app.auth.schemas import UserProfile


def _validate_token(token: str | None) -> UserProfile:
    """Return mock user if token is present (any value accepted in mock mode)."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserProfile(**{k: v for k, v in MOCK_USER.items() if k != "password"})


def get_current_user(
    authorization: str | None = Header(default=None),
) -> UserProfile:
    """Validate the Authorization header and return the mock user.

    In production this will decode and verify the JWT. In mock mode
    any Bearer token is accepted, but the header must be present.
    """
    bearer = (
        authorization.removeprefix("Bearer ")
        if authorization and authorization.startswith("Bearer ")
        else None
    )
    return _validate_token(bearer)


def get_current_user_sse(
    authorization: str | None = Header(default=None),
    token: str | None = Query(default=None),
) -> UserProfile:
    """Auth for SSE endpoints: accepts Bearer header OR ?token= query param.

    EventSource API does not support custom headers in browsers, so token
    is passed as a query parameter as a fallback.
    """
    bearer = (
        authorization.removeprefix("Bearer ")
        if authorization and authorization.startswith("Bearer ")
        else None
    )
    return _validate_token(bearer or token)


def get_current_org(
    user: UserProfile = Depends(get_current_user),
) -> str:
    """Return the org_id of the current user."""
    return user.org_id
