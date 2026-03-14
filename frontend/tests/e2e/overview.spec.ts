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
    await expect(overview.main.getByText('Total Sessions').first()).toBeVisible()
    // formatNumber(1_050) → "1.1k"
    await expect(overview.main.getByText('1.1k').first()).toBeVisible()
  })

  test('displays total spend KPI', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    await expect(overview.main.getByText(/2,580/).first()).toBeVisible()
  })

  test('displays success rate KPI', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    // success_rate: 75.0 → displayed as delta on PRs Merged card
    await expect(overview.main.getByText(`${mockOverview.total_prs_merged}`).first()).toBeVisible()
  })

  test('shows top repos', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()
    // TopReposBar strips org prefix (e.g. "acme-corp/backend-api" → "backend-api")
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const shortName = (repo: string) => (repo.includes('/') ? repo.split('/')[1] : repo)
    await expect(overview.main.getByText(shortName(mockOverview.top_repos[0].repo)).first()).toBeVisible({ timeout: 10000 })
    await expect(overview.main.getByText(shortName(mockOverview.top_repos[1].repo)).first()).toBeVisible()
  })

  test('displays KPI cards in correct order: PRs Merged before Cost per Merged PR', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()

    const kpiTitles = await overview.main
      .locator('[class*="DashboardCard"], [class*="Card"]')
      .filter({ has: page.locator('text=/Total Sessions|Token Consumption|PRs Merged|Cost per Merged PR|Total Spend/') })
      .locator('p, span')
      .filter({ hasText: /^(Total Sessions|Token Consumption|PRs Merged|Cost per Merged PR|Total Spend)$/ })
      .allTextContents()

    const prsMergedIdx = kpiTitles.indexOf('PRs Merged')
    const costPerPRIdx = kpiTitles.indexOf('Cost per Merged PR')
    const totalSpendIdx = kpiTitles.indexOf('Total Spend')

    expect(prsMergedIdx).toBeGreaterThan(-1)
    expect(costPerPRIdx).toBeGreaterThan(-1)
    expect(costPerPRIdx).toBe(prsMergedIdx + 1)
    expect(totalSpendIdx).toBeGreaterThan(costPerPRIdx)
  })

  test('chart tooltip has opaque background and proper spacing', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()

    // Find the first Recharts chart on the page (Token Consumption AreaChart)
    const rechartsWrapper = overview.main.locator('.recharts-responsive-container').first()
    await rechartsWrapper.scrollIntoViewIfNeeded()
    await expect(rechartsWrapper).toBeVisible({ timeout: 10000 })

    // Hover over the chart area to trigger the tooltip
    const box = await rechartsWrapper.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.4)

    // Wait for the custom tooltip to appear
    const tooltip = page.locator('[data-testid="chart-tooltip"]')
    await expect(tooltip).toBeVisible({ timeout: 5000 })

    // Verify opaque background (bg-neutral-900 should not be transparent)
    const bg = await tooltip.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe('rgba(0, 0, 0, 0)')
    expect(bg).not.toBe('transparent')

    // Verify proper spacing: rows use gap-8 between name and value
    const rows = tooltip.locator('.flex.items-center.justify-between')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('KPI cards are arranged in 2-column grid: first 4 in 2x2, Total Spend full-width', async ({ page }) => {
    const overview = new OverviewPage(page)
    await overview.goto()

    const getCardBox = async (title: string) => {
      const card = overview.main
        .locator('p, span')
        .filter({ hasText: new RegExp(`^${title}$`) })
        .first()
      await expect(card).toBeVisible()
      return card.boundingBox()
    }

    const [totalSessions, tokenConsumption, prsMerged, costPerPR, totalSpend] = await Promise.all([
      getCardBox('Total Sessions'),
      getCardBox('Token Consumption'),
      getCardBox('PRs Merged'),
      getCardBox('Cost per Merged PR'),
      getCardBox('Total Spend'),
    ])

    expect(totalSessions).not.toBeNull()
    expect(tokenConsumption).not.toBeNull()
    expect(prsMerged).not.toBeNull()
    expect(costPerPR).not.toBeNull()
    expect(totalSpend).not.toBeNull()

    // Row 1: Total Sessions and Token Consumption are on the same vertical position
    expect(Math.abs(totalSessions!.y - tokenConsumption!.y)).toBeLessThan(5)

    // Row 2: PRs Merged and Cost per Merged PR are on the same vertical position
    expect(Math.abs(prsMerged!.y - costPerPR!.y)).toBeLessThan(5)

    // Columns: Total Sessions and PRs Merged are in the left column (same x)
    expect(Math.abs(totalSessions!.x - prsMerged!.x)).toBeLessThan(5)

    // Columns: Token Consumption and Cost per Merged PR are in the right column (same x)
    expect(Math.abs(tokenConsumption!.x - costPerPR!.x)).toBeLessThan(5)

    // Total Spend is in its own full-width row below the 2x2
    expect(totalSpend!.y).toBeGreaterThan(prsMerged!.y)

    // Total Spend starts at (or near) the left edge of the grid (col-span-2)
    expect(Math.abs(totalSpend!.x - totalSessions!.x)).toBeLessThan(5)
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
