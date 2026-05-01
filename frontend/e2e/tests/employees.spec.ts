import { test, expect } from '../fixtures'

test.describe('employees list', () => {
  test('displays employee list on page load', async ({ page }) => {
    await page.goto('/employees')

    await expect(page.getByText('Nguyen Thi An')).toBeVisible()
    await expect(page.getByText('Tran Van Binh')).toBeVisible()
  })

  test('shows active badge for active employee', async ({ page }) => {
    await page.goto('/employees')

    await expect(page.getByText('Active', { exact: true })).toBeVisible()
  })

  test('shows inactive badge for inactive employee', async ({ page }) => {
    await page.goto('/employees')

    await expect(page.getByText('Inactive', { exact: true })).toBeVisible()
  })

  test('shows total employee count', async ({ page }) => {
    await page.goto('/employees')

    await expect(page.getByText('2 employees total')).toBeVisible()
  })
})

test.describe('create employee', () => {
  test('navigates to new employee form on Add Employee click', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('link', { name: 'Add Employee' }).click()

    await expect(page).toHaveURL(/.*employees\/new/)
    await expect(page.getByLabel('Full Name')).toBeVisible()
  })

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.goto('/employees/new')
    await page.getByRole('button', { name: 'Save Employee' }).click()

    await expect(page.getByText(/required|invalid/i).first()).toBeVisible()
  })

  test('submits form successfully and redirects to employee list', async ({ page }) => {
    await page.goto('/employees/new')

    await page.getByLabel('Full Name').fill('Le Thi Cam')
    await page.getByLabel('Phone').fill('0923456789')
    await page.getByLabel('Email (optional)').fill('le.thi.cam@example.com')
    await page.getByLabel('Revenue Share %').fill('50')
    await page.getByRole('button', { name: 'Save Employee' }).click()

    await page.waitForURL(/.*\/employees$/, { timeout: 15000 })
  })
})
