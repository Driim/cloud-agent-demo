import type { Page, Locator } from '@playwright/test'

export class SessionsPage {
  readonly page: Page
  readonly title: Locator
  readonly tableRows: Locator
  readonly nextPageBtn: Locator
  readonly prevPageBtn: Locator
  readonly statusFilter: Locator
  readonly paginationInfo: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.locator('main').getByText('Agent Sessions', { exact: true })
    this.tableRows = page.locator('tbody tr')
    this.nextPageBtn = page.getByRole('button', { name: 'Next' })
    this.prevPageBtn = page.getByRole('button', { name: 'Previous' })
    this.statusFilter = page.getByText('All statuses')
    this.paginationInfo = page.getByText(/sessions total/)
  }

  async goto(): Promise<void> {
    await this.page.goto('/sessions')
    await this.page.waitForLoadState('networkidle')
  }

  async clickRow(index: number): Promise<void> {
    await this.tableRows.nth(index).click()
  }
}
