import { z } from 'zod';

export const DailyParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type DailyParams = z.infer<typeof DailyParamsSchema>;

export const LiveEmployeeStatusSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  employeeStatus: z.string(),
  workStatus: z.string(),
});

export const TodayBookingSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  customerId: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  notes: z.string().nullable(),
});

export const ActiveSessionSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  customerId: z.string().nullable(),
  startTime: z.string(),
  status: z.string(),
});

export const TodayStatsSchema = z.object({
  customersServed: z.number(),
  totalRevenue: z.string(),
  totalTips: z.string(),
  completedSessions: z.number(),
});

export const LiveDashboardDataSchema = z.object({
  employeeStatuses: z.array(LiveEmployeeStatusSchema),
  todaysBookings: z.array(TodayBookingSchema),
  activeSessions: z.array(ActiveSessionSchema),
  todayStats: TodayStatsSchema,
});

export type LiveEmployeeStatus = z.infer<typeof LiveEmployeeStatusSchema>;
export type TodayBooking = z.infer<typeof TodayBookingSchema>;
export type ActiveSession = z.infer<typeof ActiveSessionSchema>;
export type TodayStats = z.infer<typeof TodayStatsSchema>;
export type LiveDashboardData = z.infer<typeof LiveDashboardDataSchema>;

export const DailySummaryEmployeeSchema = z.object({
  employeeId: z.string(),
  fullName: z.string(),
  sessionsCount: z.number(),
  revenue: z.string(),
  tips: z.string(),
});

export const DailySummaryDataSchema = z.object({
  date: z.string(),
  completedSessionsCount: z.number(),
  totalRevenue: z.string(),
  totalTips: z.string(),
  employeeBreakdown: z.array(DailySummaryEmployeeSchema),
});

export type DailySummaryEmployee = z.infer<typeof DailySummaryEmployeeSchema>;
export type DailySummaryData = z.infer<typeof DailySummaryDataSchema>;
