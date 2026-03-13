"""Business logic for analytics module.

Abstracts data access behind service functions so routers never import
mock_data directly. When a real data layer is wired in, only this file
needs to change.
"""

from app.analytics import mock_data
from app.analytics.schemas import (
    AdoptionRateResponse,
    CostLineItem,
    CostResponse,
    CostTrend,
    DurationBucket,
    ErrorDistributionItem,
    ErrorDistributionResponse,
    MultiSeriesPoint,
    MultiSeriesResponse,
    OverviewResponse,
    QuotaItem,
    RepoActivity,
    SessionOutcomeItem,
    SessionOutcomesResponse,
    TimeSeriesPoint,
    TimeSeriesResponse,
    TokensPerPRResponse,
)

_RANGE_DAYS: dict[str, int] = {"7d": 7, "30d": 30, "90d": 90}
_VALID_METRICS = frozenset(mock_data.TIMESERIES.keys())


def get_overview() -> OverviewResponse:
    """Return KPI overview data for the organisation."""
    data = mock_data.OVERVIEW
    return OverviewResponse(
        total_sessions=data["total_sessions"],
        total_tokens=data["total_tokens"],
        total_spend_usd=data["total_spend_usd"],
        total_prs_merged=data["total_prs_merged"],
        success_rate=data["success_rate"],
        avg_cost_per_pr_usd=data["avg_cost_per_pr_usd"],
        top_repos=[RepoActivity(**r) for r in data["top_repos"]],
    )


def get_timeseries(
    metric: str,
    range_: str = "30d",
    granularity: str = "day",
) -> TimeSeriesResponse:
    """Return time-series points filtered by range and granularity.

    Args:
        metric: One of tokens | sessions | spend | prs (validated by router).
        range_: One of 7d | 30d | 90d (validated by router).
        granularity: One of hour | day (validated by router).

    Returns:
        TimeSeriesResponse with the filtered points.
    """
    days = _RANGE_DAYS[range_]
    all_points = mock_data.TIMESERIES[metric]
    filtered = all_points[-days:]

    return TimeSeriesResponse(
        metric=metric,
        range=range_,
        granularity=granularity,
        points=[TimeSeriesPoint(**p) for p in filtered],
    )


def get_quotas() -> list[QuotaItem]:
    """Return quota usage for the organisation."""
    return [QuotaItem(**q) for q in mock_data.QUOTAS]


def get_costs() -> CostResponse:
    """Return cost breakdown and monthly trend."""
    data = mock_data.COSTS
    return CostResponse(
        total_usd=data["total_usd"],
        breakdown=[CostLineItem(**item) for item in data["breakdown"]],
        trend=[CostTrend(**t) for t in data["trend"]],
    )


def get_errors() -> ErrorDistributionResponse:
    """Return error type distribution."""
    data = mock_data.ERRORS
    return ErrorDistributionResponse(
        total_errors=data["total_errors"],
        items=[ErrorDistributionItem(**item) for item in data["items"]],
    )


def get_token_breakdown(
    range_: str = "30d",
    granularity: str = "day",
) -> MultiSeriesResponse:
    """Return stacked input/output token time-series."""
    days = _RANGE_DAYS[range_]
    input_pts = mock_data.TOKEN_BREAKDOWN["token_input"][-days:]
    output_pts = mock_data.TOKEN_BREAKDOWN["token_output"][-days:]

    points = [
        MultiSeriesPoint(
            timestamp=inp["timestamp"],
            input_tokens=inp["value"],
            output_tokens=out["value"],
        )
        for inp, out in zip(input_pts, output_pts)
    ]
    return MultiSeriesResponse(
        metric="token_breakdown",
        range=range_,
        granularity=granularity,
        points=points,
    )


def get_session_outcomes() -> SessionOutcomesResponse:
    """Return session outcome distribution."""
    data = mock_data.SESSION_OUTCOMES
    return SessionOutcomesResponse(
        total=data["total"],
        items=[SessionOutcomeItem(**item) for item in data["items"]],
    )


def get_tokens_per_pr() -> TokensPerPRResponse:
    """Return average tokens consumed per merged PR."""
    return TokensPerPRResponse(**mock_data.TOKENS_PER_PR)


def get_duration_distribution() -> list[DurationBucket]:
    """Return session duration bucket distribution."""
    return [DurationBucket(**b) for b in mock_data.DURATION_DISTRIBUTION]


def get_adoption_rate() -> AdoptionRateResponse:
    """Return team adoption rate metrics."""
    return AdoptionRateResponse(**mock_data.ADOPTION_RATE)
