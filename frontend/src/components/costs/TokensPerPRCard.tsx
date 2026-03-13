import KPICard from '../shared/KPICard'
import type { TokensPerPRResponse } from '../../types/api'

interface TokensPerPRCardProps {
  readonly data: TokensPerPRResponse
}

function TokensPerPRCard({ data }: TokensPerPRCardProps) {
  return (
    <KPICard
      title="Tokens per Merged PR"
      value={data.avg_tokens_per_pr.toLocaleString('en-US')}
      delta={`${data.delta_pct}%`}
      deltaType={data.delta_pct <= 0 ? 'moderateDecrease' : 'moderateIncrease'}
    />
  )
}

export default TokensPerPRCard
