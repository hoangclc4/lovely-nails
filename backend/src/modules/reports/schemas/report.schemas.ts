import { z } from 'zod';

export const RevenueReportParamsSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type RevenueReportParams = z.infer<typeof RevenueReportParamsSchema>;

export const EmployeeReportParamsSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type EmployeeReportParams = z.infer<typeof EmployeeReportParamsSchema>;

export const ServiceReportParamsSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ServiceReportParams = z.infer<typeof ServiceReportParamsSchema>;

const MONTH_MIN = 1;
const MONTH_MAX = 12;
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;

export const FinancialReportParamsSchema = z.object({
  month: z.coerce.number().int().min(MONTH_MIN).max(MONTH_MAX),
  year: z.coerce.number().int().min(YEAR_MIN).max(YEAR_MAX),
});

export type FinancialReportParams = z.infer<typeof FinancialReportParamsSchema>;

export type RevenueDataPoint = {
  date: string;
  sessionsCount: number;
  revenue: string;
  tips: string;
};

export type RevenueReportData = {
  dateFrom: string;
  dateTo: string;
  dataPoints: RevenueDataPoint[];
  totalSessions: number;
  totalRevenue: string;
  totalTips: string;
};

export type EmployeeReportRow = {
  employeeId: string;
  fullName: string;
  sessionsCount: number;
  revenue: string;
  tips: string;
  avgSessionMinutes: string;
};

export type EmployeeReportData = {
  dateFrom: string;
  dateTo: string;
  employees: EmployeeReportRow[];
};

export type ServiceReportRow = {
  serviceId: string;
  name: string;
  usageCount: number;
  totalRevenue: string;
  avgPrice: string;
};

export type ServiceReportData = {
  dateFrom: string;
  dateTo: string;
  services: ServiceReportRow[];
};

export type FinancialEmployeeRow = {
  employeeId: string;
  fullName: string;
  revenueGenerated: string;
  revenueShare: string;
  salaryPaid: string;
  profitMargin: string;
};

export type FinancialReportData = {
  month: number;
  year: number;
  totalRevenue: string;
  totalPayroll: string;
  totalTips: string;
  netProfit: string;
  employees: FinancialEmployeeRow[];
};
