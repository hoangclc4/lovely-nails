export interface WorkShift {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface ShiftListParams {
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
