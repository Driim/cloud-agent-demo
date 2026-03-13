import { test, expect } from '@playwright/test'
import { mockApiRoutes } from './fixtures/mocks'

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('navigates to Overview via sidebar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main').getByText('Overview', { exact: true })).toBeVisible()
    await expect(page.getByText('AgentCloud')).toBeVisible()
  })

  test('navigates to Usage & Costs via sidebar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: 'Usage & Costs' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/costs')
    await expect(page.locator('main').getByText('Usage & Costs', { exact: true })).toBeVisible()
  })

  test('navigates to Agent Sessions via sidebar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: 'Agent Sessions' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/sessions')
    await expect(page.locator('main').getByText('Agent Sessions', { exact: true })).toBeVisible()
  })

  test('navigates to Team Activity via sidebar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: 'Team Activity' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/team')
    await expect(page.locator('main').getByText('Team Activity', { exact: true })).toBeVisible()
  })

  test('sidebar highlights active link', async ({ page }) => {
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    const activeLink = page.getByRole('link', { name: 'Agent Sessions' })
    await expect(activeLink).toHaveClass(/bg-indigo-600/)
  })

  test('all four nav links are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usage & Costs' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Agent Sessions' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Team Activity' })).toBeVisible()
  })
})
