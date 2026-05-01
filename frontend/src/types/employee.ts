import { EMPLOYEE_ROLE, EMPLOYEE_STATUS, EMPLOYEE_WORK_STATUS } from '@/constants/employee.constants';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export type EmployeeRole = (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE];
export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type EmployeeWorkStatus = (typeof EMPLOYEE_WORK_STATUS)[keyof typeof EMPLOYEE_WORK_STATUS];

export interface Employee {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
  hireDate: string;
  avatarUrl: string | null;
  revenueSharePct: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithWorkStatus extends Employee {
  workStatus: EmployeeWorkStatus;
}

export interface EmployeeStatusSummary {
  id: string;
  fullName: string;
  status: EmployeeStatus;
  workStatus: EmployeeWorkStatus;
}

export interface EmployeeListParams {
  status?: EmployeeStatus;
  search?: string;
  page?: number;
  limit?: number;
}
