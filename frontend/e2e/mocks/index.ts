import type { Page } from '@playwright/test'
import { setupAuthHandlers } from './handlers/auth.handlers'
import { setupDashboardHandlers } from './handlers/dashboard.handlers'
import { setupEmployeeHandlers } from './handlers/employees.handlers'
import { setupBookingHandlers } from './handlers/bookings.handlers'
import { setupCustomerHandlers } from './handlers/customers.handlers'
import { setupServiceHandlers } from './handlers/services.handlers'

export function setupAllHandlers(page: Page): void {
  setupAuthHandlers(page)
  setupDashboardHandlers(page)
  setupEmployeeHandlers(page)
  setupBookingHandlers(page)
  setupCustomerHandlers(page)
  setupServiceHandlers(page)
}
