import type { TIP_PAYMENT_METHOD } from '@/constants/tip.constants';

export type TipPaymentMethod = (typeof TIP_PAYMENT_METHOD)[keyof typeof TIP_PAYMENT_METHOD];

export interface Tip {
  id: string;
  sessionId: string;
  employeeId: string;
  customerId: string | null;
  amount: string;
  paymentMethod: TipPaymentMethod;
  note: string | null;
  createdAt: string;
}

export interface TipListParams {
  employeeId?: string;
  sessionId?: string;
  paymentMethod?: TipPaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface TipSummaryParams {
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TipSummaryByPaymentMethod {
  paymentMethod: string;
  totalAmount: string;
  tipCount: number;
}

export interface TipSummaryByEmployee {
  employeeId: string;
  totalAmount: string;
  tipCount: number;
}

export interface TipSummary {
  totalAmount: string;
  tipCount: number;
  byPaymentMethod: TipSummaryByPaymentMethod[];
  byEmployee: TipSummaryByEmployee[];
}

export interface PaginatedTipsResponse {
  data: Tip[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
