import { z } from 'zod';

export const workShiftSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  clockIn: z.date(),
  clockOut: z.date().nullable(),
  breakMinutes: z.number().int().min(0),
  date: z.string(),
  notes: z.string().nullable(),
  createdAt: z.date(),
});

export const clockInSchema = z.object({
  employeeId: z.string().uuid(),
});

export const clockOutSchema = z.object({
  employeeId: z.string().uuid(),
});

export const breakStartSchema = z.object({
  employeeId: z.string().uuid(),
});

export const breakEndSchema = z.object({
  employeeId: z.string().uuid(),
});

export const shiftListParamsSchema = z.object({
  employeeId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const updateShiftSchema = z.object({
  clockIn: z.string().datetime().optional(),
  clockOut: z.string().datetime().optional(),
  breakMinutes: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type WorkShiftDto = z.infer<typeof workShiftSchema>;
export type ClockInDto = z.infer<typeof clockInSchema>;
export type ClockOutDto = z.infer<typeof clockOutSchema>;
export type BreakStartDto = z.infer<typeof breakStartSchema>;
export type BreakEndDto = z.infer<typeof breakEndSchema>;
export type ShiftListParamsDto = z.infer<typeof shiftListParamsSchema>;
export type UpdateShiftDto = z.infer<typeof updateShiftSchema>;
