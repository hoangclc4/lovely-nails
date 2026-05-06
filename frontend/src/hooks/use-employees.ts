import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeStatusDto,
} from '@/schemas/employee.schema';
import type {
  Employee,
  EmployeeListParams,
  EmployeeStatusSummary,
  PaginatedResponse,
} from '@/types/employee';
import { apiClient } from '@/lib/api-client';
import { EMPLOYEE_STATUS_POLL_INTERVAL_MS } from '@/constants/employee.constants';

const EMPLOYEES_QUERY_KEY = 'employees';
const EMPLOYEE_STATUS_QUERY_KEY = 'employee-status';

export const employeeKeys = {
  all: [EMPLOYEES_QUERY_KEY] as const,
  list: (params?: EmployeeListParams) => [EMPLOYEES_QUERY_KEY, params] as const,
  detail: (id: string) => [EMPLOYEES_QUERY_KEY, id] as const,
};

export const employeeStatusKeys = {
  all: [EMPLOYEE_STATUS_QUERY_KEY] as const,
};

export function useEmployeeStatuses() {
  return useQuery({
    queryKey: employeeStatusKeys.all,
    queryFn: () => apiClient.get<{ data: EmployeeStatusSummary[] }>('/employees/status'),
    refetchInterval: EMPLOYEE_STATUS_POLL_INTERVAL_MS,
  });
}

export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Employee>>('/employees', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Employee }>(`/employees/${id}`),
    enabled: id.length > 0,
  });
}

export function useCreateEmployee() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => apiClient.post<Employee>('/employees', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeDto) => apiClient.patch<Employee>(`/employees/${id}`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployeeStatus(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeStatusDto) =>
      apiClient.patch<Employee>(`/employees/${id}/status`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
