import { test, expect } from '@playwright/test'
import { mockApiRoutes, mockCosts } from './fixtures/mocks'
import { CostsPage } from './pages/CostsPage'

test.describe('Costs page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('renders page title', async ({ page }) => {
    const costs = new CostsPage(page)
    await costs.goto()
    await expect(costs.title).toBeVisible()
  })

  test('displays total spend KPI', async ({ page }) => {
    const costs = new CostsPage(page)
    await costs.goto()
    await expect(page.locator('main').getByText('Total Spend').first()).toBeVisible()
    await expect(
      page.locator('main').getByText(
        `$${mockCosts.total_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      ).first(),
    ).toBeVisible()
  })

  test('displays cost breakdown chart', async ({ page }) => {
    const costs = new CostsPage(page)
    await costs.goto()
    await expect(page.locator('main').getByText('Cost Breakdown').first()).toBeVisible()
    // Verify the DonutChart SVG element is rendered
    await expect(page.locator('main svg').first()).toBeAttached()
  })

  test('shows error when API fails', async ({ page }) => {
    await page.route('**/api/v1/analytics/costs', (route) =>
      route.fulfill({ status: 500, body: 'Internal server error' }),
    )
    const costs = new CostsPage(page)
    await costs.goto()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
