import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PublicEmployee, PublicBookingRequest, PublicBookingResponse } from '@/types/public';

const EMPTY_STRING = '';

export const publicAvailabilityKeys = {
  check: (date: string, startTime: string, endTime: string) =>
    ['public-availability', date, startTime, endTime] as const,
};

export function usePublicAvailability(date: string, startTime: string, endTime: string) {
  return useQuery({
    queryKey: publicAvailabilityKeys.check(date, startTime, endTime),
    queryFn: () =>
      apiClient.get<{ data: PublicEmployee[] }>('/public/availability', {
        params: { date, startTime, endTime },
      }),
    select: (res) => res.data,
    enabled: date !== EMPTY_STRING && startTime !== EMPTY_STRING && endTime !== EMPTY_STRING,
  });
}

export function useCreatePublicBooking() {
  return useMutation({
    mutationFn: async (data: PublicBookingRequest) => {
      const res = await apiClient.post<{ data: PublicBookingResponse }>('/public/bookings', data);
      return res.data;
    },
  });
}
