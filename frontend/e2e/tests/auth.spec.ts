import { test, expect } from '../fixtures'

test.describe('unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('redirects to /login when accessing protected route', async ({ page }) => {
    await page.goto('/employees')
    await expect(page).toHaveURL(/.*login/)
  })

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 400,
        json: { message: 'Invalid credentials.' },
      })
    })

    await page.goto('/login')
    await page.locator('[autocomplete="email"]').fill('wrong@example.com')
    await page.locator('[autocomplete="current-password"]').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid credentials.')).toBeVisible()
  })

  test('successful login redirects to /dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[autocomplete="email"]').fill('admin@example.com')
    await page.locator('[autocomplete="current-password"]').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/.*dashboard/)
  })
})

test.describe('authenticated', () => {
  test('shows sidebar navigation', async ({ page }) => {
    await page.goto('/employees')
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('login page redirects to /dashboard when already authenticated', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
