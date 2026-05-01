export interface RevenueDataPoint {
  date: string;
  revenue: string;
  sessionsCount: number;
  tips: string;
}

export interface RevenueReport {
  dateFrom: string;
  dateTo: string;
  totalRevenue: string;
  totalTips: string;
  totalSessions: number;
  dataPoints: RevenueDataPoint[];
}

export interface EmployeeReportEntry {
  employeeId: string;
  fullName: string;
  sessionsCount: number;
  revenue: string;
  tips: string;
  avgSessionMinutes: string;
}

export interface EmployeeReport {
  dateFrom: string;
  dateTo: string;
  employees: EmployeeReportEntry[];
}

export interface ServiceReportEntry {
  serviceId: string;
  name: string;
  usageCount: number;
  totalRevenue: string;
  avgPrice: string;
}

export interface ServiceReport {
  dateFrom: string;
  dateTo: string;
  services: ServiceReportEntry[];
}

export interface FinancialEmployeeEntry {
  employeeId: string;
  fullName: string;
  revenueGenerated: string;
  revenueShare: string;
  salaryPaid: string;
  profitMargin: string;
}

export interface FinancialReport {
  month: number;
  year: number;
  totalRevenue: string;
  totalPayroll: string;
  totalTips: string;
  netProfit: string;
  employees: FinancialEmployeeEntry[];
}
