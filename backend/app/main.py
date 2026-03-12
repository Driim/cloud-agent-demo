"""FastAPI application entry point."""

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.analytics.router import router as analytics_router
from app.auth.router import router as auth_router
from app.config import settings
from app.repositories.router import router as repositories_router
from app.sessions.router import router as sessions_router
from app.team.router import router as team_router

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


api_router.include_router(auth_router)
api_router.include_router(analytics_router)
api_router.include_router(sessions_router)
api_router.include_router(team_router)
api_router.include_router(repositories_router)

app.include_router(api_router)
