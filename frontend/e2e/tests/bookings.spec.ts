import { test, expect } from '../fixtures'
import { BOOKINGS_FIXTURE } from '../mocks/data/bookings.data'

const FIRST_BOOKING = BOOKINGS_FIXTURE.data[0]
const SECOND_BOOKING = BOOKINGS_FIXTURE.data[1]

test.describe('Bookings page', () => {
  test('shows page title and New Booking button', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'New Booking' })).toBeVisible()
  })

  test('shows list view and calendar view toggles', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.getByRole('button', { name: 'List View' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Calendar View' })).toBeVisible()
  })

  test('displays bookings in the table', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.getByText(FIRST_BOOKING.bookingDate).first()).toBeVisible()
    await expect(page.getByText(SECOND_BOOKING.bookingDate).first()).toBeVisible()
  })

  test('shows correct status badges', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.getByText('Pending').first()).toBeVisible()
    await expect(page.getByText('Confirmed').first()).toBeVisible()
  })

  test('shows total bookings count', async ({ page }) => {
    await page.goto('/bookings')
    const total = BOOKINGS_FIXTURE.meta.total
    await expect(page.getByText(`${total} bookings total`)).toBeVisible()
  })

  test('table has correct column headers', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('New Booking link navigates to /bookings/new', async ({ page }) => {
    await page.goto('/bookings')
    await page.getByRole('link', { name: 'New Booking' }).click()
    await page.waitForURL(/.*\/bookings\/new/, { timeout: 10000 })
    expect(page.url()).toContain('/bookings/new')
  })
})
