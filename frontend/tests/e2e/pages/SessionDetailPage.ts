import type { Page, Locator } from '@playwright/test'

export class SessionDetailPage {
  readonly page: Page
  readonly backLink: Locator
  readonly repoCard: Locator
  readonly userCard: Locator
  readonly prLink: Locator

  constructor(page: Page) {
    this.page = page
    this.backLink = page.getByText('← Back')
    this.repoCard = page.getByText('Repository')
    this.userCard = page.getByText('User')
    this.prLink = page.getByRole('link', { name: /^#\d+/ })
  }

  async goto(sessionId: string): Promise<void> {
    await this.page.goto(`/sessions/${sessionId}`)
    await this.page.waitForLoadState('networkidle')
  }
}
