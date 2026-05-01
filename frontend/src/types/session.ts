import type { SESSION_STATUS } from '@/constants/session.constants';

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export interface SessionService {
  id: string;
  sessionId: string;
  serviceId: string;
  priceAtTime: string;
  durationMinutes: number;
}

export interface SessionAddOn {
  id: string;
  sessionId: string;
  name: string;
  priceAtTime: string;
}

export interface SessionTimeExtension {
  id: string;
  sessionId: string;
  extraMinutes: number;
  reason: string;
  addedBy: string;
  createdAt: string;
}

export interface Session {
  id: string;
  sessionNumber: string;
  bookingId: string | null;
  employeeId: string;
  customerId: string | null;
  customerName: string | null;
  startTime: string;
  endTime: string | null;
  status: SessionStatus;
  notes: string | null;
  createdAt: string;
  services: SessionService[];
  addOns: SessionAddOn[];
  extensions: SessionTimeExtension[];
}

export interface SessionSummary {
  id: string;
  sessionNumber: string;
  bookingId: string | null;
  employeeId: string;
  customerId: string | null;
  customerName: string | null;
  startTime: string;
  endTime: string | null;
  status: SessionStatus;
  notes: string | null;
  createdAt: string;
  totalAmount: string | null;
}

export interface SessionListParams {
  employeeId?: string;
  customerId?: string;
  status?: SessionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
