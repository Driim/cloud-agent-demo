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

  test('displays Usage Quotas below Tokens per Merged PR', async ({ page }) => {
    const costs = new CostsPage(page)
    await costs.goto()

    const main = page.locator('main')

    const tokensPerPR = main.getByText('Tokens per Merged PR').first()
    const quotasTitle = main.getByText('Usage Quotas').first()

    await expect(tokensPerPR).toBeVisible()
    await expect(quotasTitle).toBeVisible()

    const tokensBox = await tokensPerPR.boundingBox()
    const quotasBox = await quotasTitle.boundingBox()

    expect(tokensBox).not.toBeNull()
    expect(quotasBox).not.toBeNull()
    // Usage Quotas should appear below Tokens per Merged PR
    expect(quotasBox!.y).toBeGreaterThan(tokensBox!.y)
  })

  test('spend chart tooltip has opaque background and proper spacing', async ({ page }) => {
    const costs = new CostsPage(page)
    await costs.goto()

    const main = page.locator('main')
    // Find the first Recharts LineChart (Daily Spend Trend)
    const rechartsWrapper = main.locator('.recharts-responsive-container').first()
    await rechartsWrapper.scrollIntoViewIfNeeded()
    await expect(rechartsWrapper).toBeVisible({ timeout: 10000 })

    const box = await rechartsWrapper.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.4)

    const tooltip = page.locator('[data-testid="chart-tooltip"]')
    await expect(tooltip).toBeVisible({ timeout: 5000 })

    // Verify opaque background
    const bg = await tooltip.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(bg).not.toBe('transparent')

    // Verify proper spacing and formatted value with $
    const rows = tooltip.locator('.flex.items-center.justify-between')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    const valueText = await rows.first().locator('.tabular-nums').textContent()
    expect(valueText).toMatch(/^\$/)
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
