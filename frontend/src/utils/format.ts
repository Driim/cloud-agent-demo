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
