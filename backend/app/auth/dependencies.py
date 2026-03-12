"""FastAPI dependencies for auth module."""

from app.auth.mock_data import MOCK_USER
from app.auth.schemas import UserProfile


def get_current_user() -> UserProfile:
    """Return the fixed mock authenticated user (org_admin role).

    In production this will validate the JWT from the Authorization header
    or httpOnly cookie and return the corresponding user profile.
    """
    return UserProfile(**{k: v for k, v in MOCK_USER.items() if k != "password"})


def get_current_org(user: UserProfile = None) -> str:
    """Return the org_id of the current user.

    Depends on get_current_user; extracted separately so endpoints that only
    need org_id can declare a lighter dependency.
    """
    if user is None:
        user = get_current_user()
    return user.org_id
