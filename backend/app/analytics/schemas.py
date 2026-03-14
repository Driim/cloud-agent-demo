"""Pydantic schemas for analytics module."""

from datetime import date

from pydantic import BaseModel


class RepoActivity(BaseModel):
    """Top repository by session count."""

    repo: str
    sessions: int


class OverviewResponse(BaseModel):
    """KPI cards for the overview dashboard."""

    total_sessions: int
    total_tokens: int
    total_spend_usd: float
    total_spend_delta_pct: float
    total_prs_merged: int
    success_rate: float
    avg_cost_per_pr_usd: float
    avg_cost_per_pr_delta_pct: float
    top_repos: list[RepoActivity]


class TimeSeriesPoint(BaseModel):
    """Single data point in a time series."""

    timestamp: date
    value: float


class TimeSeriesResponse(BaseModel):
    """Time series data for a metric."""

    metric: str
    range: str
    granularity: str
    points: list[TimeSeriesPoint]


class QuotaItem(BaseModel):
    """Usage quota for a single resource."""

    name: str
    used: float
    limit: float
    unit: str


class CostLineItem(BaseModel):
    """Single line item in the cost breakdown."""

    category: str
    amount_usd: float
    percentage: float


class CostTrend(BaseModel):
    """Month-over-month cost trend point."""

    month: str
    amount_usd: float


class CostResponse(BaseModel):
    """Cost breakdown and monthly trend."""

    total_usd: float
    breakdown: list[CostLineItem]
    trend: list[CostTrend]


class ErrorDistributionItem(BaseModel):
    """Count for a single error type."""

    error_type: str
    count: int
    percentage: float


class ErrorDistributionResponse(BaseModel):
    """Distribution of errors across error types."""

    total_errors: int
    items: list[ErrorDistributionItem]


# ── Token breakdown (stacked input/output) ──


class MultiSeriesPoint(BaseModel):
    """Single point with input/output token split."""

    timestamp: date
    input_tokens: float
    output_tokens: float


class MultiSeriesResponse(BaseModel):
    """Multi-series time-series data (e.g. stacked token chart)."""

    metric: str
    range: str
    granularity: str
    points: list[MultiSeriesPoint]


# ── Session outcomes ──


class SessionOutcomeItem(BaseModel):
    """Count for a single session outcome status."""

    status: str
    count: int
    percentage: float


class SessionOutcomesResponse(BaseModel):
    """Distribution of sessions by outcome status."""

    total: int
    items: list[SessionOutcomeItem]


# ── Tokens per PR ──


class TokensPerPRResponse(BaseModel):
    """Average tokens consumed per merged PR."""

    avg_tokens_per_pr: int
    delta_pct: float


# ── Duration distribution ──


class DurationBucket(BaseModel):
    """Session duration bucket with count."""

    bucket: str
    count: int


# ── Adoption rate ──


class AdoptionRateResponse(BaseModel):
    """Team adoption rate metrics."""

    rate_7d: float
    rate_30d: float
    total_members: int
    active_7d: int
    active_30d: int
    delta_7d_pct: float
