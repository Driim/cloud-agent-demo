import { test, expect } from '@playwright/test'
import { mockApiRoutes, mockSessionDetail } from './fixtures/mocks'
import { SessionDetailPage } from './pages/SessionDetailPage'

const SESSION_ID = mockSessionDetail.session_id

test.describe('Session detail page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('renders session id in title', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    // Component slices session_id to first 12 chars: sess-aabbccd
    await expect(page.getByText(/Session sess-aabbccd/)).toBeVisible()
  })

  test('shows repository card', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await expect(page.locator('main').getByText('Repository').first()).toBeVisible()
    await expect(page.locator('main').getByText(mockSessionDetail.repo).first()).toBeVisible()
  })

  test('shows user card', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await expect(page.locator('main').getByText(mockSessionDetail.user).first()).toBeVisible()
  })

  test('shows cost card', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await expect(page.locator('main').getByText('Cost').first()).toBeVisible()
    // Component renders cost_usd.toFixed(2) without $ sign in Metric
    await expect(page.locator('main').getByText('1.45').first()).toBeVisible()
  })

  test('shows PR link for github.com URL', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    const prLink = detail.prLink
    await expect(prLink).toBeVisible()
    await expect(prLink).toHaveAttribute('href', mockSessionDetail.pr_url!)
    await expect(prLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('Back link navigates to sessions list', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await detail.backLink.click()
    await expect(page).toHaveURL('/sessions')
  })

  test('shows branch and commit info', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await expect(page.locator('main').getByText(mockSessionDetail.branch)).toBeVisible()
    await expect(page.locator('main').getByText('Commits').first()).toBeVisible()
    await expect(page.locator('main').getByText('Files Changed').first()).toBeVisible()
  })

  test('shows timeline events', async ({ page }) => {
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await expect(page.getByText('Session started')).toBeVisible()
    await expect(page.getByText('Pull request #101 created')).toBeVisible()
  })

  test('shows error state when API fails', async ({ page }) => {
    await page.route(`**/api/v1/sessions/${SESSION_ID}`, (route) =>
      route.fulfill({ status: 404, body: 'Not found' }),
    )
    const detail = new SessionDetailPage(page)
    await detail.goto(SESSION_ID)
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
