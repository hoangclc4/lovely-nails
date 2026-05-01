import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SessionPhoto } from '@/types/session-photo';
import type { AddSessionPhotoDto } from '@/schemas/session-photo.schema';
import type { PaginatedResponse } from '@/types/session';
import { apiClient } from '@/lib/api-client';

export const sessionPhotoKeys = {
  all: ['session-photos'] as const,
  bySession: (sessionId: string) => ['session-photos', 'session', sessionId] as const,
  byCustomer: (customerId: string) => ['session-photos', 'customer', customerId] as const,
  byEmployee: (employeeId: string) => ['session-photos', 'employee', employeeId] as const,
};

export function useSessionPhotos(sessionId: string) {
  return useQuery({
    queryKey: sessionPhotoKeys.bySession(sessionId),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<SessionPhoto>>(`/sessions/${sessionId}/photos`)
        .then((res) => res.data),
    enabled: sessionId.length > 0,
  });
}

export function useAddSessionPhoto(sessionId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: AddSessionPhotoDto) =>
      apiClient.post<SessionPhoto>(`/sessions/${sessionId}/photos`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionPhotoKeys.bySession(sessionId) });
    },
  });
}

export function useDeleteSessionPhoto(sessionId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      apiClient.delete<void>(`/sessions/${sessionId}/photos/${photoId}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionPhotoKeys.bySession(sessionId) });
      void client.invalidateQueries({ queryKey: ['session-photos', 'customer'] });
      void client.invalidateQueries({ queryKey: ['session-photos', 'employee'] });
    },
  });
}

export function useCustomerPhotos(customerId: string) {
  return useQuery({
    queryKey: sessionPhotoKeys.byCustomer(customerId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<SessionPhoto>>(`/customers/${customerId}/photos`),
    enabled: customerId.length > 0,
  });
}

export function useEmployeePortfolio(employeeId: string) {
  return useQuery({
    queryKey: sessionPhotoKeys.byEmployee(employeeId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<SessionPhoto>>(`/employees/${employeeId}/portfolio`),
    enabled: employeeId.length > 0,
  });
}
