import { Grid, Title } from '@tremor/react'
import { useOverview, useTimeseries, useErrors } from '../api/analytics'
import OverviewKPIs from '../components/overview/OverviewKPIs'
import TokenChart from '../components/overview/TokenChart'
import OutcomesDonut from '../components/overview/OutcomesDonut'
import TopReposBar from '../components/overview/TopReposBar'
import CostPerPRCard from '../components/overview/CostPerPRCard'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { sanitizeApiError } from '../utils/errors'

function OverviewPage() {
  const overview = useOverview()
  const tokenSeries = useTimeseries('tokens')
  const errors = useErrors()

  if (overview.isLoading || tokenSeries.isLoading || errors.isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  const pageErrors = [overview.error, tokenSeries.error, errors.error].filter(Boolean) as Error[]
  if (pageErrors.length > 0) {
    const message =
      pageErrors.length === 1
        ? sanitizeApiError(pageErrors[0])
        : `${pageErrors.length} data sources failed — ${sanitizeApiError(pageErrors[0])}`
    return (
      <ErrorState
        message={message}
        onRetry={() => {
          void overview.refetch()
          void tokenSeries.refetch()
          void errors.refetch()
        }}
      />
    )
  }

  if (!overview.data || !tokenSeries.data || !errors.data) {
    return null
  }

  return (
    <div className="space-y-6">
      <Title>Overview</Title>
      <OverviewKPIs data={overview.data} />
      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <TokenChart data={tokenSeries.data} />
        <OutcomesDonut data={errors.data} />
      </Grid>
      <TopReposBar data={overview.data.top_repos} />
      <CostPerPRCard avgCostPerPr={overview.data.avg_cost_per_pr_usd} />
    </div>
  )
}

export default OverviewPage
