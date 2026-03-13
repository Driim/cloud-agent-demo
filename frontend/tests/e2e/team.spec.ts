import { test, expect } from '@playwright/test'
import { mockApiRoutes, mockTeam } from './fixtures/mocks'
import { TeamPage } from './pages/TeamPage'

test.describe('Team page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('renders page title', async ({ page }) => {
    const team = new TeamPage(page)
    await team.goto()
    await expect(team.title).toBeVisible()
  })

  test('displays team member names', async ({ page }) => {
    const team = new TeamPage(page)
    await team.goto()
    // Use .first() — names may appear in both chart SVG and table
    await expect(page.locator('main').getByText(mockTeam[0].display_name).first()).toBeVisible()
    await expect(page.locator('main').getByText(mockTeam[1].display_name).first()).toBeVisible()
    await expect(page.locator('main').getByText(mockTeam[2].display_name).first()).toBeVisible()
  })

  test('shows error when API fails', async ({ page }) => {
    await page.route('**/api/v1/analytics/team', (route) =>
      route.fulfill({ status: 503, body: 'Service unavailable' }),
    )
    const team = new TeamPage(page)
    await team.goto()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
