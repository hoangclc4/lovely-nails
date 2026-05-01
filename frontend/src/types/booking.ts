import type { BOOKING_STATUS } from '@/constants/booking.constants';

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string | null;
  customerName: string | null;
  employeeId: string;
  employeeName: string;
  serviceIds: string[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableEmployee {
  id: string;
  fullName: string;
  workStatus: string;
  available: boolean;
  busyUntil?: string;
}

export interface BookingListParams {
  date?: string;
  employeeId?: string;
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

export interface AvailabilityQuery {
  date: string;
  startTime: string;
  endTime: string;
}

export interface CalendarQuery {
  startDate: string;
  endDate: string;
}

export type CalendarData = Record<string, Booking[]>;
