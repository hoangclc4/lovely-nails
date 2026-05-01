import { test as base, expect } from '@playwright/test'
import { setupAllHandlers } from '../mocks'

export const test = base.extend<{ mockApi: void }>({
  mockApi: [
    async ({ page }, use) => {
      setupAllHandlers(page)
      await use()
    },
    { auto: true },
  ],
})

export { expect }
