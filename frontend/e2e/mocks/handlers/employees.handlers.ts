import type { Page } from '@playwright/test'
import { EMPLOYEES_FIXTURE, NEW_EMPLOYEE_FIXTURE } from '../data/employees.data'

export function setupEmployeeHandlers(page: Page): void {
  // Register general handler first (lower priority)
  page.route('**/api/v1/employees**', (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      return route.fulfill({ status: 200, json: EMPLOYEES_FIXTURE })
    }

    if (method === 'POST') {
      return route.fulfill({ status: 201, json: NEW_EMPLOYEE_FIXTURE })
    }

    route.continue()
  })

  // Register specific handler after — takes precedence over the general one above
  page.route('**/api/v1/employees/status', (route) => {
    route.fulfill({ status: 200, json: [] })
  })
}
