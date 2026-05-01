import type { Page } from '@playwright/test'
import { BOOKINGS_FIXTURE, AVAILABLE_EMPLOYEES_FIXTURE, NEW_BOOKING_FIXTURE } from '../data/bookings.data'

export function setupBookingHandlers(page: Page): void {
  page.route('**/api/v1/bookings**', (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      return route.fulfill({ status: 200, json: BOOKINGS_FIXTURE })
    }

    if (method === 'POST') {
      return route.fulfill({ status: 201, json: NEW_BOOKING_FIXTURE })
    }

    route.continue()
  })

  page.route('**/api/v1/bookings/availability**', (route) => {
    route.fulfill({ status: 200, json: AVAILABLE_EMPLOYEES_FIXTURE })
  })
}
