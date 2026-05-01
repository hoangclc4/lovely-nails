export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  notes: string | null;
  totalVisits: number;
  totalSpent: string;
  lastVisitDate: string | null;
  noShowCount: number;
  lateCancelCount: number;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: { total: number; page: number; limit: number };
}

export interface SessionHistory {
  sessionId: string;
  startTime: string | null;
  endTime: string | null;
  totalAmount: string;
  status: string;
  employeeId: string;
}

export interface CustomerHistoryResponse {
  customer: Customer;
  sessions: SessionHistory[];
}
