import { expect } from '@playwright/test'
import { test as setup } from '../fixtures'

const ADMIN_AUTH_FILE = 'e2e/.auth/admin.json'

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')

  await page.locator('[autocomplete="email"]').fill('admin@example.com')
  await page.locator('[autocomplete="current-password"]').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/.*dashboard/)

  await page.context().storageState({ path: ADMIN_AUTH_FILE })
})
