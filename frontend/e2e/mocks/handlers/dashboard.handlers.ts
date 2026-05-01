import type { Page } from '@playwright/test'
import { EMPTY_DASHBOARD } from '../data/dashboard.data'

export function setupDashboardHandlers(page: Page): void {
  page.route('**/api/v1/dashboard/**', (route) => {
    route.fulfill({ status: 200, json: EMPTY_DASHBOARD })
  })
}
