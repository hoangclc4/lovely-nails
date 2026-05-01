import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClockInDto, ClockOutDto, BreakStartDto, BreakEndDto, UpdateShiftDto } from '@/schemas/shift.schema';
import type { WorkShift, ShiftListParams } from '@/types/shift';
import type { PaginatedResponse } from '@/types/employee';
import { apiClient } from '@/lib/api-client';
import { employeeStatusKeys } from './use-employees';

const SHIFTS_QUERY_KEY = 'shifts';

export const shiftKeys = {
  all: [SHIFTS_QUERY_KEY] as const,
  list: (params?: ShiftListParams) => [SHIFTS_QUERY_KEY, params] as const,
};

export function useShifts(params?: ShiftListParams) {
  return useQuery({
    queryKey: shiftKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<WorkShift>>('/shifts', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useClockIn() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: ClockInDto) => apiClient.post<WorkShift>('/shifts/clock-in', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: shiftKeys.all });
      void client.invalidateQueries({ queryKey: employeeStatusKeys.all });
    },
  });
}

export function useClockOut() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: ClockOutDto) => apiClient.post<WorkShift>('/shifts/clock-out', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: shiftKeys.all });
      void client.invalidateQueries({ queryKey: employeeStatusKeys.all });
    },
  });
}

export function useBreakStart() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: BreakStartDto) => apiClient.post<WorkShift>('/shifts/break/start', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: shiftKeys.all });
      void client.invalidateQueries({ queryKey: employeeStatusKeys.all });
    },
  });
}

export function useBreakEnd() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: BreakEndDto) => apiClient.post<WorkShift>('/shifts/break/end', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: shiftKeys.all });
      void client.invalidateQueries({ queryKey: employeeStatusKeys.all });
    },
  });
}

export function useUpdateShift(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShiftDto) => apiClient.patch<WorkShift>(`/shifts/${id}`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: shiftKeys.all });
    },
  });
}
