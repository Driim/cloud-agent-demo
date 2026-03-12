"""Pydantic schemas for analytics module."""

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
    total_prs_merged: int
    success_rate: float
    avg_cost_per_pr_usd: float
    top_repos: list[RepoActivity]


class TimeSeriesPoint(BaseModel):
    """Single data point in a time series."""

    timestamp: str  # ISO-8601 date string
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
