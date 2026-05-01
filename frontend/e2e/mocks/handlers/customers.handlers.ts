import type { Page } from '@playwright/test'
import { CUSTOMERS_FIXTURE, NEW_CUSTOMER_FIXTURE } from '../data/customers.data'

export function setupCustomerHandlers(page: Page): void {
  page.route('**/api/v1/customers**', (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      return route.fulfill({ status: 200, json: CUSTOMERS_FIXTURE })
    }

    if (method === 'POST') {
      return route.fulfill({ status: 201, json: NEW_CUSTOMER_FIXTURE })
    }

    route.continue()
  })
}
