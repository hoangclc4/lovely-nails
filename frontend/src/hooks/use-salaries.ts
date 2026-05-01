import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GenerateSalaryDto, AddAdjustmentDto } from '@/schemas/salary.schema';
import type {
  SalaryRecord,
  SalaryDetail,
  SalaryPayslip,
  SalaryListParams,
  PaginatedSalariesResponse,
} from '@/types/salary';
import { apiClient } from '@/lib/api-client';

const SALARIES_KEY = 'salaries';

export const salaryKeys = {
  all: [SALARIES_KEY] as const,
  list: (params?: SalaryListParams) => [SALARIES_KEY, params] as const,
  detail: (id: string) => [SALARIES_KEY, id] as const,
  payslip: (id: string) => [SALARIES_KEY, id, 'payslip'] as const,
};

export function useSalaries(params?: SalaryListParams) {
  return useQuery({
    queryKey: salaryKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedSalariesResponse>('/salary', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useSalaryDetail(id: string) {
  return useQuery({
    queryKey: salaryKeys.detail(id),
    queryFn: () => apiClient.get<{ data: SalaryDetail }>(`/salary/${id}/detail`),
    enabled: id.length > 0,
  });
}

export function useSalaryPayslip(id: string) {
  return useQuery({
    queryKey: salaryKeys.payslip(id),
    queryFn: () => apiClient.get<{ data: SalaryPayslip }>(`/salary/${id}/payslip`),
    enabled: id.length > 0,
  });
}

export function useGenerateSalary() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateSalaryDto) =>
      apiClient.post<SalaryRecord[]>('/salary/generate', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: salaryKeys.all });
    },
  });
}

export function useAddAdjustment(salaryId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: AddAdjustmentDto) =>
      apiClient.post<unknown>(`/salary/${salaryId}/adjustments`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: salaryKeys.all });
    },
  });
}

export function useConfirmSalary() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<SalaryRecord>(`/salary/${id}/confirm`, {}),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: salaryKeys.all });
    },
  });
}

export function useMarkPaidSalary() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<SalaryRecord>(`/salary/${id}/mark-paid`, {}),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: salaryKeys.all });
    },
  });
}
