import { z } from 'zod';
import { INCIDENT_TYPE, type IncidentType } from '../../../common/constants/incident.constants';

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
  createdAt: Date;
}

export interface IncidentReport {
  month: number;
  year: number;
  totalNoShows: number;
  totalLateCancels: number;
  totalRevenueLost: string;
  topOffenders: Array<{ customerId: string; count: number }>;
}

export const incidentTypeSchema = z.enum([
  INCIDENT_TYPE.NO_SHOW,
  INCIDENT_TYPE.LATE_CANCEL,
]);

export const updateIncidentSchema = z.object({
  excused: z.boolean().optional(),
  notes: z.string().optional(),
});

export const incidentListParamsSchema = z.object({
  type: incidentTypeSchema.optional(),
  customerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  excused: z.preprocess(
    (v) => {
      if (v === undefined || v === '') return undefined;
      return v === 'true' || v === true;
    },
    z.boolean().optional(),
  ),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const incidentReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).optional(),
});

export type UpdateIncidentDto = z.infer<typeof updateIncidentSchema>;
export type IncidentListParams = z.infer<typeof incidentListParamsSchema>;
export type IncidentReportQuery = z.infer<typeof incidentReportQuerySchema>;
