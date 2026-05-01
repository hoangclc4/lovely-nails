import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LiveDashboardData, DailySummaryData } from '@/types/dashboard';

const DASHBOARD_LIVE_REFETCH_INTERVAL_MS = 30_000;

export const dashboardKeys = {
  live: (date?: string) => ['dashboard', 'live', date] as const,
  daily: (date?: string) => ['dashboard', 'daily', date] as const,
};

export function useLiveDashboard(date?: string) {
  return useQuery({
    queryKey: dashboardKeys.live(date),
    queryFn: () =>
      apiClient.get<{ data: LiveDashboardData }>('/dashboard/live', {
        params: { date },
      }),
    select: (response) => response.data,
    refetchInterval: DASHBOARD_LIVE_REFETCH_INTERVAL_MS,
  });
}

export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: dashboardKeys.daily(date),
    queryFn: () =>
      apiClient.get<DailySummaryData>('/dashboard/daily-summary', {
        params: { date },
      }),
  });
}
