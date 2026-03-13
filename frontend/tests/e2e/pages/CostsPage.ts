import type { Page, Locator } from '@playwright/test'

export class CostsPage {
  readonly page: Page
  readonly title: Locator
  readonly timeRangeSelector: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.locator('main').getByText('Usage & Costs', { exact: true })
    this.timeRangeSelector = page.locator('[class*="TimeRangeSelector"], select').first()
  }

  async goto(): Promise<void> {
    await this.page.goto('/costs')
    await this.page.waitForLoadState('networkidle')
  }
}
