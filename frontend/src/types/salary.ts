export type SalaryStatus = 'draft' | 'confirmed' | 'paid';
export type AdjustmentType = 'bonus' | 'deduction' | 'advance' | 'penalty' | 'other';

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  totalServicesCount: number;
  totalServiceRevenue: string;
  revenueSharePctSnapshot: string;
  technicianRevenueShare: string;
  ownerRevenueShare: string;
  totalTips: string;
  bonuses: string;
  deductions: string;
  grossPay: string;
  netPay: string;
  status: SalaryStatus;
  notes: string | null;
  confirmedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface SalaryAdjustment {
  id: string;
  salaryId: string;
  type: AdjustmentType;
  amount: string;
  reason: string;
  createdAt: string;
}

export interface SalaryDetail {
  salary: SalaryRecord;
  adjustments: SalaryAdjustment[];
}

export interface SalaryPayslip {
  salary: SalaryRecord;
  employeeName: string;
  adjustments: SalaryAdjustment[];
}

export interface SalaryListParams {
  employeeId?: string;
  month?: number;
  year?: number;
  status?: SalaryStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedSalariesResponse {
  data: SalaryRecord[];
  meta: { total: number; page: number; limit: number };
}
