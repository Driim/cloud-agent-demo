import { test, expect } from '@playwright/test'
import { mockApiRoutes, mockSessions } from './fixtures/mocks'
import { SessionsPage } from './pages/SessionsPage'

test.describe('Sessions page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('renders page title', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(sessions.title).toBeVisible()
  })

  test('displays sessions table with correct rows', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(sessions.tableRows).toHaveCount(mockSessions.data.length)
  })

  test('shows repo and user in table rows', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(page.getByText('org/frontend')).toBeVisible()
    await expect(page.getByText('alice@example.com')).toBeVisible()
    await expect(page.getByText('org/backend')).toBeVisible()
  })

  test('shows pagination total', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(sessions.paginationInfo).toBeVisible()
    await expect(page.getByText(/1,247 sessions total/)).toBeVisible()
  })

  test('Next button is enabled when has_more=true', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(sessions.nextPageBtn).not.toBeDisabled()
  })

  test('Previous button is disabled on first page', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(sessions.prevPageBtn).toBeDisabled()
  })

  test('clicking a row navigates to session detail', async ({ page }) => {
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await sessions.clickRow(0)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/sessions\/sess-aabbccdd1122/)
  })

  test('shows error when API fails', async ({ page }) => {
    await page.route('**/api/v1/sessions**', (route) => {
      const url = new URL(route.request().url())
      if (!url.pathname.includes('/sessions/')) {
        route.fulfill({ status: 503, body: 'Service unavailable' })
      } else {
        route.continue()
      }
    })
    const sessions = new SessionsPage(page)
    await sessions.goto()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })
})
