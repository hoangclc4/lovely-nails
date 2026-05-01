import { test, expect } from '../fixtures'
import { SERVICES_FIXTURE, NEW_SERVICE_FIXTURE } from '../mocks/data/services.data'

const FIRST_SERVICE = SERVICES_FIXTURE.data[0]
const SECOND_SERVICE = SERVICES_FIXTURE.data[1]

test.describe('Services page', () => {
  test('shows page title and Add Service button', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Add Service' })).toBeVisible()
  })

  test('displays services in the table', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByText(FIRST_SERVICE.name)).toBeVisible()
    await expect(page.getByText(SECOND_SERVICE.name)).toBeVisible()
  })

  test('shows correct status badges', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByText('Active', { exact: true })).toBeVisible()
    await expect(page.getByText('Inactive', { exact: true })).toBeVisible()
  })

  test('shows total services count', async ({ page }) => {
    await page.goto('/services')
    const total = SERVICES_FIXTURE.meta.total
    await expect(page.getByText(`${total} services total`)).toBeVisible()
  })

  test('shows correct table column headers', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('Add Service link navigates to /services/new', async ({ page }) => {
    await page.goto('/services')
    await page.getByRole('link', { name: 'Add Service' }).click()
    await page.waitForURL(/.*\/services\/new/, { timeout: 10000 })
    expect(page.url()).toContain('/services/new')
  })

  test('new service form shows required fields', async ({ page }) => {
    await page.goto('/services/new')
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Price (VND)')).toBeVisible()
    await expect(page.getByLabel('Duration (minutes)')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save Service' })).toBeVisible()
  })

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await page.goto('/services/new')
    await page.getByRole('button', { name: 'Save Service' }).click()
    await expect(page.getByText(/at least 1 character/i).first()).toBeVisible()
  })

  test('creates service and redirects to /services', async ({ page }) => {
    await page.goto('/services/new')
    await page.getByLabel('Name').fill(NEW_SERVICE_FIXTURE.name)
    await page.getByLabel('Price (VND)').fill(NEW_SERVICE_FIXTURE.price)
    await page.getByLabel('Duration (minutes)').fill(String(NEW_SERVICE_FIXTURE.durationMinutes))
    await page.getByRole('button', { name: 'Save Service' }).click()
    await page.waitForURL(/.*\/services$/, { timeout: 15000 })
    expect(page.url()).toContain('/services')
  })
})
