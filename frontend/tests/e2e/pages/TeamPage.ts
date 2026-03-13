import type { Page, Locator } from '@playwright/test'

export class TeamPage {
  readonly page: Page
  readonly title: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.locator('main').getByText('Team Activity', { exact: true })
  }

  async goto(): Promise<void> {
    await this.page.goto('/team')
    await this.page.waitForLoadState('networkidle')
  }
}
