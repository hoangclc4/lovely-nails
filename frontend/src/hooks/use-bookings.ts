import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  AvailabilityQuery,
  AvailableEmployee,
  Booking,
  BookingListParams,
  CalendarData,
  CalendarQuery,
} from '@/types/booking';
import type { CreateBookingFormData, UpdateBookingStatusFormData } from '@/schemas/booking.schema';
import type { PaginatedResponse } from '@/types/employee';

const BOOKINGS_QUERY_KEY = 'bookings';
const AVAILABILITY_QUERY_KEY = 'availability';
const CALENDAR_QUERY_KEY = 'calendar';

export const bookingKeys = {
  all: [BOOKINGS_QUERY_KEY] as const,
  list: (params?: BookingListParams) => [BOOKINGS_QUERY_KEY, 'list', params] as const,
  detail: (id: string) => [BOOKINGS_QUERY_KEY, id] as const,
  availability: (query: AvailabilityQuery) => [BOOKINGS_QUERY_KEY, AVAILABILITY_QUERY_KEY, query] as const,
  calendar: (query: CalendarQuery) => [BOOKINGS_QUERY_KEY, CALENDAR_QUERY_KEY, query] as const,
  nextNumber: (date: string) => [BOOKINGS_QUERY_KEY, 'next-number', date] as const,
};

interface ApiWrappedList<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

interface ApiWrapped<T> {
  success: boolean;
  data: T;
}

function isApiWrappedList<T>(res: unknown): res is ApiWrappedList<T> {
  return (
    typeof res === 'object' &&
    res !== null &&
    'success' in res &&
    'data' in res &&
    Array.isArray((res as ApiWrappedList<T>).data) &&
    'meta' in res
  );
}

function isApiWrapped<T>(res: unknown): res is ApiWrapped<T> {
  return (
    typeof res === 'object' &&
    res !== null &&
    'success' in res &&
    'data' in res &&
    !Array.isArray((res as ApiWrapped<T>).data)
  );
}

export function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: async (): Promise<PaginatedResponse<Booking>> => {
      const res = await apiClient.get<unknown>(
        '/bookings',
        { params: params as Record<string, string | number | boolean | undefined> },
      );
      if (isApiWrappedList<Booking>(res)) {
        return { data: res.data, meta: res.meta };
      }
      return res as PaginatedResponse<Booking>;
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async (): Promise<Booking> => {
      const res = await apiClient.get<unknown>(`/bookings/${id}`);
      if (isApiWrapped<Booking>(res)) {
        return res.data;
      }
      return res as Booking;
    },
    enabled: id.length > 0,
  });
}

export function useBookingAvailability(query: AvailabilityQuery, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.availability(query),
    queryFn: async (): Promise<AvailableEmployee[]> => {
      const res = await apiClient.get<unknown>(
        '/bookings/availability',
        {
          params: {
            date: query.date,
            startTime: query.startTime,
            endTime: query.endTime,
          },
        },
      );
      if (
        typeof res === 'object' &&
        res !== null &&
        'success' in res &&
        'data' in res &&
        Array.isArray((res as ApiWrapped<AvailableEmployee[]>).data)
      ) {
        return (res as ApiWrapped<AvailableEmployee[]>).data;
      }
      return res as AvailableEmployee[];
    },
    enabled,
  });
}

export function useBookingCalendar(query: CalendarQuery) {
  return useQuery({
    queryKey: bookingKeys.calendar(query),
    queryFn: async (): Promise<CalendarData> => {
      const res = await apiClient.get<unknown>(
        '/bookings/calendar',
        {
          params: {
            startDate: query.startDate,
            endDate: query.endDate,
          },
        },
      );
      if (isApiWrapped<CalendarData>(res)) {
        return res.data;
      }
      return res as CalendarData;
    },
  });
}

export function useNextBookingNumber(date: string) {
  return useQuery({
    queryKey: bookingKeys.nextNumber(date),
    queryFn: async (): Promise<string> => {
      const res = await apiClient.get<unknown>('/bookings/next-number', { params: { date } });
      if (isApiWrapped<string>(res)) return res.data;
      return res as string;
    },
    enabled: date.length > 0,
  });
}

export function useCreateBooking() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingFormData) =>
      apiClient.post<ApiWrapped<Booking>>('/bookings', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useUpdateBookingStatus(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBookingStatusFormData) =>
      apiClient.patch<ApiWrapped<Booking>>(`/bookings/${id}/status`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      void client.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useCancelBooking() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<ApiWrapped<Booking>>(`/bookings/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useMarkNoShow(bookingId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<ApiWrapped<unknown>>(`/bookings/${bookingId}/no-show`, {}),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      void client.invalidateQueries({ queryKey: bookingKeys.all });
      void client.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
