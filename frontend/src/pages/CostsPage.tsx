import { useState } from 'react'
import { Grid, Title } from '@tremor/react'
import { useCosts, useTimeseries, useQuotas, useTokensPerPR } from '../api/analytics'
import SpendTrend from '../components/costs/SpendTrend'
import CostBreakdownDonut from '../components/costs/CostBreakdownDonut'
import CostTrendChart from '../components/costs/CostTrendChart'
import TokensPerPRCard from '../components/costs/TokensPerPRCard'
import QuotasList from '../components/costs/QuotasList'
import BudgetAlerts from '../components/costs/BudgetAlerts'
import KPICard from '../components/shared/KPICard'
import TimeRangeSelector from '../components/shared/TimeRangeSelector'
import LoadingSkeleton from '../components/shared/LoadingSkeleton'
import ErrorState from '../components/shared/ErrorState'
import { sanitizeApiError } from '../utils/errors'
import type { TimeSeriesRange } from '../types/api'

function CostsPage() {
  const [range, setRange] = useState<TimeSeriesRange>('30d')
  const spendSeries = useTimeseries('spend', range)
  const costPerSession = useTimeseries('cost_per_session', range)
  const costs = useCosts()
  const quotas = useQuotas()
  const tokensPerPR = useTokensPerPR()

  if (spendSeries.isLoading || costs.isLoading || quotas.isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  const pageErrors = [spendSeries.error, costs.error, quotas.error].filter(Boolean) as Error[]
  if (pageErrors.length > 0) {
    const message =
      pageErrors.length === 1
        ? sanitizeApiError(pageErrors[0])
        : `${pageErrors.length} data sources failed — ${sanitizeApiError(pageErrors[0])}`
    return (
      <ErrorState
        message={message}
        onRetry={() => {
          void spendSeries.refetch()
          void costs.refetch()
          void quotas.refetch()
          void costPerSession.refetch()
          void tokensPerPR.refetch()
        }}
      />
    )
  }

  if (!spendSeries.data || !costs.data || !quotas.data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title className="text-white">Usage &amp; Costs</Title>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <Grid numItemsSm={2} numItemsLg={2} className="gap-6">
        <KPICard
          title="Total Spend"
          value={`$${costs.data.total_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        />
        {tokensPerPR.data && <TokensPerPRCard data={tokensPerPR.data} />}
      </Grid>

      <SpendTrend data={spendSeries.data} />

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <CostBreakdownDonut data={costs.data.breakdown} />
        {costPerSession.data && <CostTrendChart data={costPerSession.data} />}
      </Grid>

      <QuotasList data={quotas.data} />
      <BudgetAlerts quotas={quotas.data} />
    </div>
  )
}

export default CostsPage
