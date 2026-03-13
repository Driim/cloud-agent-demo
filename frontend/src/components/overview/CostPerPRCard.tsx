import KPICard from '../shared/KPICard'

interface CostPerPRCardProps {
  readonly avgCostPerPr: number
}

function CostPerPRCard({ avgCostPerPr }: CostPerPRCardProps) {
  return (
    <KPICard
      title="Cost per Merged PR"
      value={`$${avgCostPerPr.toFixed(2)}`}
    />
  )
}

export default CostPerPRCard
