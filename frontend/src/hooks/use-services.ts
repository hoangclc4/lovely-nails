import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  CreateServiceDto,
  UpdateServiceDto,
  CreateServiceAddOnDto,
  UpdateServiceAddOnDto,
} from '@/schemas/service.schema';
import type {
  Service,
  ServiceCategory,
  ServiceAddOn,
  ServiceListParams,
  ServiceCategoryListParams,
  ServiceAddOnListParams,
  PaginatedResponse,
} from '@/types/service';
import { apiClient } from '@/lib/api-client';

const SERVICE_CATEGORIES_KEY = 'service-categories';
const SERVICES_KEY = 'services';
const SERVICE_ADD_ONS_KEY = 'service-add-ons';

export const serviceCategoryKeys = {
  all: [SERVICE_CATEGORIES_KEY] as const,
  list: (params?: ServiceCategoryListParams) => [SERVICE_CATEGORIES_KEY, params] as const,
  detail: (id: string) => [SERVICE_CATEGORIES_KEY, id] as const,
};

export const serviceKeys = {
  all: [SERVICES_KEY] as const,
  list: (params?: ServiceListParams) => [SERVICES_KEY, params] as const,
  detail: (id: string) => [SERVICES_KEY, id] as const,
};

export const serviceAddOnKeys = {
  all: [SERVICE_ADD_ONS_KEY] as const,
  list: (params?: ServiceAddOnListParams) => [SERVICE_ADD_ONS_KEY, params] as const,
  detail: (id: string) => [SERVICE_ADD_ONS_KEY, id] as const,
};

export function useServiceCategories(params?: ServiceCategoryListParams) {
  return useQuery({
    queryKey: serviceCategoryKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ServiceCategory>>('/service-categories', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useServiceCategory(id: string) {
  return useQuery({
    queryKey: serviceCategoryKeys.detail(id),
    queryFn: () => apiClient.get<{ data: ServiceCategory }>(`/service-categories/${id}`),
    select: (res) => res.data,
    enabled: id.length > 0,
  });
}

export function useCreateServiceCategory() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceCategoryDto) =>
      apiClient.post<ServiceCategory>('/service-categories', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceCategoryKeys.all });
    },
  });
}

export function useUpdateServiceCategory(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceCategoryDto) =>
      apiClient.patch<ServiceCategory>(`/service-categories/${id}`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceCategoryKeys.all });
    },
  });
}

export function useDeleteServiceCategory(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete<void>(`/service-categories/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceCategoryKeys.all });
    },
  });
}

export function useServices(params?: ServiceListParams) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Service>>('/services', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Service }>(`/services/${id}`),
    select: (res) => res.data,
    enabled: id.length > 0,
  });
}

export function useCreateService() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => apiClient.post<Service>('/services', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useUpdateService(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceDto) => apiClient.patch<Service>(`/services/${id}`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useDeactivateService(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.patch<Service>(`/services/${id}`, { isActive: false }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useDeleteService(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete<Service>(`/services/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useServiceAddOns(params?: ServiceAddOnListParams) {
  return useQuery({
    queryKey: serviceAddOnKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ServiceAddOn>>('/service-add-ons', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useCreateServiceAddOn() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceAddOnDto) =>
      apiClient.post<ServiceAddOn>('/service-add-ons', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceAddOnKeys.all });
    },
  });
}

export function useUpdateServiceAddOn(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceAddOnDto) =>
      apiClient.patch<ServiceAddOn>(`/service-add-ons/${id}`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: serviceAddOnKeys.all });
    },
  });
}
