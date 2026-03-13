import { describe, it, expect, afterEach } from 'vitest'
import { sanitizeApiError } from './errors'

describe('sanitizeApiError', () => {
  const originalDev = import.meta.env.DEV

  afterEach(() => {
    import.meta.env.DEV = originalDev
  })

  it('returns error.message in dev mode', () => {
    import.meta.env.DEV = true
    const error = new Error('Internal path: /api/v1/sessions leaked detail')
    expect(sanitizeApiError(error)).toBe('Internal path: /api/v1/sessions leaked detail')
  })

  it('returns generic message in production mode', () => {
    import.meta.env.DEV = false
    const error = new Error('Sensitive server detail')
    expect(sanitizeApiError(error)).toBe('Something went wrong. Please try again.')
  })

  it('returns generic message for non-Error values in dev mode', () => {
    import.meta.env.DEV = true
    expect(sanitizeApiError('raw string error')).toBe('Something went wrong. Please try again.')
    expect(sanitizeApiError(42)).toBe('Something went wrong. Please try again.')
  })

  it('returns generic message for null', () => {
    expect(sanitizeApiError(null)).toBe('Something went wrong. Please try again.')
  })

  it('returns generic message for undefined', () => {
    expect(sanitizeApiError(undefined)).toBe('Something went wrong. Please try again.')
  })
})
