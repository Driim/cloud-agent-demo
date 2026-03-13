"""Analytics router: KPI overview, time-series, quotas, costs, and errors."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.analytics import service
from app.analytics.schemas import (
    AdoptionRateResponse,
    CostResponse,
    DurationBucket,
    ErrorDistributionResponse,
    MultiSeriesResponse,
    OverviewResponse,
    QuotaItem,
    SessionOutcomesResponse,
    TimeSeriesResponse,
    TokensPerPRResponse,
)
from app.auth.dependencies import get_current_user
from app.auth.schemas import UserProfile

router = APIRouter(prefix="/analytics", tags=["analytics"])

_VALID_RANGES = {"7d", "30d", "90d"}
_VALID_GRANULARITIES = {"hour", "day"}
_VALID_METRICS = {"tokens", "sessions", "spend", "prs", "latency_p95", "cost_per_session"}


@router.get("/overview", response_model=OverviewResponse)
async def get_overview(
    _: UserProfile = Depends(get_current_user),
) -> OverviewResponse:
    """Return KPI cards for the organisation overview dashboard."""
    return service.get_overview()


@router.get("/timeseries/{metric}", response_model=TimeSeriesResponse)
async def get_timeseries(
    metric: str,
    range: str = Query(default="30d", description="Time range: 7d | 30d | 90d"),
    granularity: str = Query(default="day", description="Granularity: hour | day"),
    _: UserProfile = Depends(get_current_user),
) -> TimeSeriesResponse:
    """Return time-series data for a given metric."""
    if metric not in _VALID_METRICS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown metric '{metric}'. Valid values: {sorted(_VALID_METRICS)}",
        )
    if range not in _VALID_RANGES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown range '{range}'. Valid values: {sorted(_VALID_RANGES)}",
        )
    if granularity not in _VALID_GRANULARITIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown granularity '{granularity}'. Valid values: {sorted(_VALID_GRANULARITIES)}",
        )
    return service.get_timeseries(metric=metric, range_=range, granularity=granularity)


@router.get("/quotas", response_model=list[QuotaItem])
async def get_quotas(
    _: UserProfile = Depends(get_current_user),
) -> list[QuotaItem]:
    """Return quota usage for the organisation."""
    return service.get_quotas()


@router.get("/costs", response_model=CostResponse)
async def get_costs(
    _: UserProfile = Depends(get_current_user),
) -> CostResponse:
    """Return cost breakdown and monthly trend."""
    return service.get_costs()


@router.get("/errors", response_model=ErrorDistributionResponse)
async def get_errors(
    _: UserProfile = Depends(get_current_user),
) -> ErrorDistributionResponse:
    """Return distribution of errors by type."""
    return service.get_errors()


@router.get("/token-breakdown", response_model=MultiSeriesResponse)
async def get_token_breakdown(
    range: str = Query(default="30d", description="Time range: 7d | 30d | 90d"),
    granularity: str = Query(default="day", description="Granularity: hour | day"),
    _: UserProfile = Depends(get_current_user),
) -> MultiSeriesResponse:
    """Return stacked input/output token time-series."""
    if range not in _VALID_RANGES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown range '{range}'. Valid values: {sorted(_VALID_RANGES)}",
        )
    return service.get_token_breakdown(range_=range, granularity=granularity)


@router.get("/session-outcomes", response_model=SessionOutcomesResponse)
async def get_session_outcomes(
    _: UserProfile = Depends(get_current_user),
) -> SessionOutcomesResponse:
    """Return session outcome distribution."""
    return service.get_session_outcomes()


@router.get("/tokens-per-pr", response_model=TokensPerPRResponse)
async def get_tokens_per_pr(
    _: UserProfile = Depends(get_current_user),
) -> TokensPerPRResponse:
    """Return average tokens consumed per merged PR."""
    return service.get_tokens_per_pr()


@router.get("/duration-distribution", response_model=list[DurationBucket])
async def get_duration_distribution(
    _: UserProfile = Depends(get_current_user),
) -> list[DurationBucket]:
    """Return session duration bucket distribution."""
    return service.get_duration_distribution()


@router.get("/adoption-rate", response_model=AdoptionRateResponse)
async def get_adoption_rate(
    _: UserProfile = Depends(get_current_user),
) -> AdoptionRateResponse:
    """Return team adoption rate metrics."""
    return service.get_adoption_rate()
