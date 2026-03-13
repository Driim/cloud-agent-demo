import type { Page, Locator } from '@playwright/test'

export class OverviewPage {
  readonly page: Page
  readonly main: Locator
  readonly title: Locator

  constructor(page: Page) {
    this.page = page
    this.main = page.locator('main')
    this.title = this.main.getByText('Overview', { exact: true })
  }

  async goto(): Promise<void> {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }
}
