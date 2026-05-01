export const INCIDENT_TYPE = {
  NO_SHOW: 'no_show',
  LATE_CANCEL: 'late_cancel',
} as const;

export type IncidentType = (typeof INCIDENT_TYPE)[keyof typeof INCIDENT_TYPE];

export interface BookingIncident {
  id: string;
  bookingId: string;
  customerId: string | null;
  employeeId: string;
  type: IncidentType;
  scheduledDate: string;
  scheduledTime: string;
  estimatedRevenueLost: string;
  notes: string | null;
  excused: boolean;
  createdAt: string;
}

export interface IncidentListParams {
  type?: IncidentType;
  customerId?: string;
  employeeId?: string;
  excused?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface IncidentReport {
  month: number;
  year: number;
  totalNoShows: number;
  totalLateCancels: number;
  totalRevenueLost: string;
  topOffenders: Array<{ customerId: string; count: number }>;
}
