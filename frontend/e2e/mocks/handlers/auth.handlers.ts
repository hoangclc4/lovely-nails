import type { Page } from '@playwright/test'
import { MOCK_AUTH_TOKENS } from '../data/auth.data'

export function setupAuthHandlers(page: Page): void {
  page.route('**/api/v1/auth/login', (route) => {
    route.fulfill({
      status: 200,
      json: { data: MOCK_AUTH_TOKENS },
    })
  })
}
