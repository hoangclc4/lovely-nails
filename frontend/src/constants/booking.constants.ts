export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export const BOOKINGS_PATH = '/bookings';
export const BOOKINGS_API_PATH = '/bookings';
export const ALL_STATUSES_VALUE = 'all';
export const WEEK_LENGTH = 7;
export const FIRST_DAY_OF_WEEK = DAYS_OF_WEEK.MONDAY;
