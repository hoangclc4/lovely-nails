import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Customer, CustomerListResponse, CustomerHistoryResponse } from '@/types/customer';
import type { CreateCustomerInput, UpdateCustomerInput } from '@/schemas/customer.schema';

export const customerKeys = {
  all: ['customers'] as const,
  list: (params?: Record<string, unknown>) => ['customers', 'list', params] as const,
  detail: (id: string) => ['customers', id] as const,
  history: (id: string) => ['customers', id, 'history'] as const,
};

export function useCustomers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () =>
      apiClient.get<CustomerListResponse>('/customers', {
        params: {
          search: params?.search,
          page: params?.page,
          limit: params?.limit,
        },
      }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Customer }>(`/customers/${id}`),
    enabled: id.length > 0,
  });
}

export function useCustomerHistory(id: string) {
  return useQuery({
    queryKey: customerKeys.history(id),
    queryFn: () =>
      apiClient.get<{ data: CustomerHistoryResponse }>(`/customers/${id}/history`),
    enabled: id.length > 0,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerInput) =>
      apiClient.post<{ data: Customer }>('/customers', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCustomerInput) =>
      apiClient.patch<{ data: Customer }>(`/customers/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
