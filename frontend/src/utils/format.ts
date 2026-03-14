export function formatDuration(sec: number): string {
  const rounded = Math.round(Math.max(0, sec))
  if (rounded < 60) return `${rounded}s`
  const min = Math.floor(rounded / 60)
  const remaining = rounded % 60
  return remaining > 0 ? `${min}m ${remaining}s` : `${min}m`
}

export function formatChartDate(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function formatUSD(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDelta(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}
