import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  BookingIncident,
  IncidentListParams,
  IncidentReport,
} from '@/types/incident';

const INCIDENTS_QUERY_KEY = 'incidents';

export const incidentKeys = {
  all: [INCIDENTS_QUERY_KEY] as const,
  list: (params?: IncidentListParams) => [INCIDENTS_QUERY_KEY, 'list', params] as const,
  detail: (id: string) => [INCIDENTS_QUERY_KEY, id] as const,
  report: (month?: number, year?: number) => [INCIDENTS_QUERY_KEY, 'report', month, year] as const,
  byCustomer: (customerId: string) => [INCIDENTS_QUERY_KEY, 'customer', customerId] as const,
};

interface ApiWrappedList<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number };
}

interface ApiWrapped<T> {
  success: boolean;
  data: T;
}

function isApiWrappedList<T>(res: unknown): res is ApiWrappedList<T> {
  return (
    typeof res === 'object' &&
    res !== null &&
    'data' in res &&
    Array.isArray((res as ApiWrappedList<T>).data) &&
    'meta' in res
  );
}

function isApiWrapped<T>(res: unknown): res is ApiWrapped<T> {
  return (
    typeof res === 'object' &&
    res !== null &&
    'data' in res &&
    !Array.isArray((res as ApiWrapped<T>).data)
  );
}

export function useIncidents(params?: IncidentListParams) {
  return useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: async (): Promise<{ data: BookingIncident[]; meta: { total: number; page: number; limit: number } }> => {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        ...params,
        excused: params?.excused,
      };
      const res = await apiClient.get<unknown>('/incidents', { params: queryParams });
      if (isApiWrappedList<BookingIncident>(res)) {
        return { data: res.data, meta: res.meta };
      }
      return res as { data: BookingIncident[]; meta: { total: number; page: number; limit: number } };
    },
  });
}

export function useIncidentReport(month?: number, year?: number) {
  return useQuery({
    queryKey: incidentKeys.report(month, year),
    queryFn: async (): Promise<IncidentReport> => {
      const res = await apiClient.get<unknown>('/incidents/report', {
        params: { month, year } as Record<string, number | undefined>,
      });
      if (isApiWrapped<IncidentReport>(res)) return res.data;
      return res as IncidentReport;
    },
  });
}

export function useCustomerIncidents(customerId: string) {
  return useQuery({
    queryKey: incidentKeys.byCustomer(customerId),
    queryFn: async (): Promise<BookingIncident[]> => {
      const res = await apiClient.get<unknown>(`/incidents/customer/${customerId}`);
      if (isApiWrapped<BookingIncident[]>(res)) return res.data;
      if (Array.isArray(res)) return res as BookingIncident[];
      return [];
    },
    enabled: customerId.length > 0,
  });
}

export function useUpdateIncident() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, excused, notes }: { id: string; excused?: boolean; notes?: string }) =>
      apiClient.patch<ApiWrapped<BookingIncident>>(`/incidents/${id}`, { excused, notes }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}
