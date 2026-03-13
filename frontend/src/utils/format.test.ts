import { describe, it, expect } from 'vitest'
import { formatDuration, formatChartDate } from './format'

describe('formatDuration', () => {
  it('returns seconds when under 60', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(1)).toBe('1s')
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('returns minutes only when no remaining seconds', () => {
    expect(formatDuration(60)).toBe('1m')
    expect(formatDuration(120)).toBe('2m')
    expect(formatDuration(3600)).toBe('60m')
  })

  it('returns minutes and seconds when there are remaining seconds', () => {
    expect(formatDuration(61)).toBe('1m 1s')
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(125)).toBe('2m 5s')
  })
})

describe('formatChartDate', () => {
  it('formats an ISO timestamp to short month and day', () => {
    const result = formatChartDate('2025-03-15T00:00:00.000Z')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/15/)
  })

  it('formats January correctly', () => {
    const result = formatChartDate('2025-01-01T12:00:00.000Z')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/1/)
  })

  it('formats December correctly', () => {
    const result = formatChartDate('2025-12-31T00:00:00.000Z')
    expect(result).toMatch(/Dec/)
  })
})
