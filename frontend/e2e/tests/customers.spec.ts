import { test, expect } from '../fixtures'
import { CUSTOMERS_FIXTURE, NEW_CUSTOMER_FIXTURE } from '../mocks/data/customers.data'

const FIRST_CUSTOMER = CUSTOMERS_FIXTURE.data[0]
const SECOND_CUSTOMER = CUSTOMERS_FIXTURE.data[1]

test.describe('Customers page', () => {
  test('shows page title and Add Customer button', async ({ page }) => {
    await page.goto('/customers')
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Add Customer' })).toBeVisible()
  })

  test('displays customers in the table', async ({ page }) => {
    await page.goto('/customers')
    await expect(page.getByText(FIRST_CUSTOMER.fullName)).toBeVisible()
    await expect(page.getByText(SECOND_CUSTOMER.fullName)).toBeVisible()
  })

  test('shows phone numbers', async ({ page }) => {
    await page.goto('/customers')
    await expect(page.getByText(FIRST_CUSTOMER.phone)).toBeVisible()
    await expect(page.getByText(SECOND_CUSTOMER.phone)).toBeVisible()
  })

  test('shows total customers count', async ({ page }) => {
    await page.goto('/customers')
    const total = CUSTOMERS_FIXTURE.meta.total
    await expect(page.getByText(`${total} customers total`)).toBeVisible()
  })

  test('shows correct table column headers', async ({ page }) => {
    await page.goto('/customers')
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Phone' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible()
  })

  test('Add Customer link navigates to /customers/new', async ({ page }) => {
    await page.goto('/customers')
    await page.getByRole('link', { name: 'Add Customer' }).click()
    await page.waitForURL(/.*\/customers\/new/, { timeout: 10000 })
    expect(page.url()).toContain('/customers/new')
  })

  test('new customer form shows required fields', async ({ page }) => {
    await page.goto('/customers/new')
    await expect(page.getByPlaceholder('Enter full name')).toBeVisible()
    await expect(page.getByPlaceholder('Enter phone number')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save Customer' })).toBeVisible()
  })

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await page.goto('/customers/new')
    await page.getByRole('button', { name: 'Save Customer' }).click()
    await expect(page.getByText(/name/i).first()).toBeVisible()
  })

  test('creates customer and redirects to /customers', async ({ page }) => {
    await page.goto('/customers/new')
    await page.getByPlaceholder('Enter full name').fill(NEW_CUSTOMER_FIXTURE.fullName)
    await page.getByPlaceholder('Enter phone number').fill(NEW_CUSTOMER_FIXTURE.phone)
    await page.getByRole('button', { name: 'Save Customer' }).click()
    await page.waitForURL(/.*\/customers$/, { timeout: 15000 })
    expect(page.url()).toContain('/customers')
  })
})
