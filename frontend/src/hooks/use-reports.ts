import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { RevenueReport, EmployeeReport, ServiceReport, FinancialReport } from '@/types/report';

export interface RevenueParams {
  dateFrom: string;
  dateTo: string;
}

export interface DateRangeParams {
  dateFrom: string;
  dateTo: string;
}

export interface FinancialParams {
  month: number;
  year: number;
}

export const reportKeys = {
  revenue: (params: RevenueParams) => ['reports', 'revenue', params] as const,
  employees: (params: DateRangeParams) => ['reports', 'employees', params] as const,
  services: (params: DateRangeParams) => ['reports', 'services', params] as const,
  financial: (params: FinancialParams) => ['reports', 'financial', params] as const,
};

export function useRevenueReport(params: RevenueParams) {
  return useQuery({
    queryKey: reportKeys.revenue(params),
    queryFn: () =>
      apiClient.get<{ data: RevenueReport }>('/reports/revenue', {
        params: { dateFrom: params.dateFrom, dateTo: params.dateTo },
      }),
    enabled: params.dateFrom.length > 0 && params.dateTo.length > 0,
  });
}

export function useEmployeeReport(params: DateRangeParams) {
  return useQuery({
    queryKey: reportKeys.employees(params),
    queryFn: () =>
      apiClient.get<{ data: EmployeeReport }>('/reports/employees', {
        params: { dateFrom: params.dateFrom, dateTo: params.dateTo },
      }),
    enabled: params.dateFrom.length > 0 && params.dateTo.length > 0,
  });
}

export function useServiceReport(params: DateRangeParams) {
  return useQuery({
    queryKey: reportKeys.services(params),
    queryFn: () =>
      apiClient.get<{ data: ServiceReport }>('/reports/services', {
        params: { dateFrom: params.dateFrom, dateTo: params.dateTo },
      }),
    enabled: params.dateFrom.length > 0 && params.dateTo.length > 0,
  });
}

export function useFinancialReport(params: FinancialParams) {
  return useQuery({
    queryKey: reportKeys.financial(params),
    queryFn: () =>
      apiClient.get<{ data: FinancialReport }>('/reports/financial', {
        params: { month: params.month, year: params.year },
      }),
    enabled: params.month > 0 && params.year > 0,
  });
}
