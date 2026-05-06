import type { SessionStatus } from '@/types/session';

export interface EmployeeStatusEntry {
  id: string;
  fullName: string;
  workStatus: 'free' | 'busy' | 'break' | 'off';
  employeeStatus: string;
}

export interface TodayBooking {
  id: string;
  employeeId: string;
  customerId: string | null;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  totalAmount: string | null;
}

export interface ActiveSession {
  id: string;
  sessionNumber: string | null;
  employeeId: string;
  customerId: string | null;
  startTime: string;
  status: SessionStatus;
}

export interface TodayStats {
  customersServed: number;
  totalRevenue: string;
  totalTips: string;
  completedSessions: number;
}

export interface LiveDashboardData {
  employeeStatuses: EmployeeStatusEntry[];
  todaysBookings: TodayBooking[];
  activeSessions: ActiveSession[];
  todayStats: TodayStats;
}

export interface EmployeePerformanceEntry {
  employeeId: string;
  fullName: string;
  sessions: number;
  revenue: string;
  tips: string;
}

export interface DailySummaryData {
  date: string;
  totalCustomersServed: number;
  totalRevenue: string;
  totalTips: string;
  completedSessions: number;
  employeePerformance: EmployeePerformanceEntry[];
}
