import type { Page } from '@playwright/test'
import { SERVICES_FIXTURE, SERVICE_CATEGORIES_FIXTURE, NEW_SERVICE_FIXTURE } from '../data/services.data'

export function setupServiceHandlers(page: Page): void {
  page.route('**/api/v1/services**', (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      return route.fulfill({ status: 200, json: SERVICES_FIXTURE })
    }

    if (method === 'POST') {
      return route.fulfill({ status: 201, json: NEW_SERVICE_FIXTURE })
    }

    route.continue()
  })

  page.route('**/api/v1/service-categories**', (route) => {
    route.fulfill({ status: 200, json: SERVICE_CATEGORIES_FIXTURE })
  })
}
