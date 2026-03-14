import KPICard from '../shared/KPICard'
import { formatNumber, formatUSD, formatDelta } from '../../utils/format'
import type { OverviewResponse } from '../../types/api'

interface OverviewKPIsProps {
  readonly data: OverviewResponse
  readonly sessionsTrend?: readonly number[]
}

function OverviewKPIs({ data, sessionsTrend }: OverviewKPIsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <KPICard
        title="Total Sessions"
        value={formatNumber(data.total_sessions)}
        trendData={sessionsTrend}
      />
      <KPICard
        title="Token Consumption"
        value={formatNumber(data.total_tokens)}
      />
      <KPICard
        title="PRs Merged"
        value={data.total_prs_merged.toString()}
        delta={`${(data.success_rate * 100).toFixed(0)}% success`}
        deltaType="moderateIncrease"
      />
      <KPICard
        title="Cost per Merged PR"
        value={formatUSD(data.avg_cost_per_pr_usd)}
        delta={formatDelta(data.avg_cost_per_pr_delta_pct)}
        deltaType={data.avg_cost_per_pr_delta_pct <= 0 ? 'moderateIncrease' : 'moderateDecrease'}
      />
      <div className="col-span-2">
        <KPICard
          title="Total Spend"
          value={formatUSD(data.total_spend_usd)}
          delta={formatDelta(data.total_spend_delta_pct)}
          deltaType={data.total_spend_delta_pct >= 0 ? 'moderateDecrease' : 'moderateIncrease'}
        />
      </div>
    </div>
  )
}

export default OverviewKPIs
