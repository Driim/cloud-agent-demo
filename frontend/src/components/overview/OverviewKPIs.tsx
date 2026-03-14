import KPICard from '../shared/KPICard'
import type { OverviewResponse } from '../../types/api'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

function formatUSD(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface OverviewKPIsProps {
  readonly data: OverviewResponse
}

function OverviewKPIs({ data }: OverviewKPIsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <KPICard
        title="Total Sessions"
        value={formatNumber(data.total_sessions)}
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
      />
      <div className="col-span-2">
        <KPICard
          title="Total Spend"
          value={formatUSD(data.total_spend_usd)}
        />
      </div>
    </div>
  )
}

export default OverviewKPIs
