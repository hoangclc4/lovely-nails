import { z } from 'zod';

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

export const updateShiftSchema = z.object({
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  breakMinutes: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type ClockInDto = z.infer<typeof clockInSchema>;
export type ClockOutDto = z.infer<typeof clockOutSchema>;
export type BreakStartDto = z.infer<typeof breakStartSchema>;
export type BreakEndDto = z.infer<typeof breakEndSchema>;
export type UpdateShiftDto = z.infer<typeof updateShiftSchema>;
