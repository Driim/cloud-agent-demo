import { test, expect } from '@playwright/test'
import { mockApiRoutes, mockOverview } from './fixtures/mocks'
import { OverviewPage } from './pages/OverviewPage'

test.describe('Overview page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('renders page title', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    await expect(overview.title).toBeVisible()
  })

  test('displays total sessions KPI', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    // formatNumber(1247) → "1.2k"
    await expect(overview.main.getByText('Total Sessions').first()).toBeVisible()
    await expect(overview.main.getByText('1.2k').first()).toBeVisible()
  })

  test('displays total spend KPI', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    await expect(overview.main.getByText(/1,842/).first()).toBeVisible()
  })

  test('displays success rate KPI', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    await expect(overview.main.getByText(/87%/).first()).toBeVisible()
  })

  test('shows top repos', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    await expect(overview.main.getByText('org/frontend').first()).toBeVisible()
    await expect(overview.main.getByText('org/backend').first()).toBeVisible()
  })

  test('shows error when API fails', async ({ page }) => {
    await page.route('**/api/v1/analytics/overview', (route) =>
      route.fulfill({ status: 500, body: 'Server error' }),
    )
    const overview = new OverviewPage(page)
    await overview.goto()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
