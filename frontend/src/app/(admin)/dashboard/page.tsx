'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLiveDashboard } from '@/hooks/use-dashboard';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateInput } from '@/components/ui/date-input';
import { formatCurrency } from '@/lib/utils';
import { SessionStatusBadge } from '@/components/sessions/session-status-badge';
import type { EmployeeStatusEntry, TodayBooking, ActiveSession } from '@/types/dashboard';

const WORK_STATUS_CLASS: Record<EmployeeStatusEntry['workStatus'], string> = {
  free: 'bg-green-100 text-green-700',
  busy: 'bg-yellow-100 text-yellow-700',
  break: 'bg-orange-100 text-orange-700',
  off: 'bg-gray-100 text-gray-500',
};

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function SkeletonCard() {
  return <div className="h-24 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tWorkStatus = useTranslations('workStatus');

  const [selectedDate, setSelectedDate] = useState<string>(toDateString(new Date()));

  const { data, isLoading, isError } = useLiveDashboard(selectedDate);

  const stats = data?.todayStats;
  const employeeStatuses = data?.employeeStatuses ?? [];
  const todaysBookings = data?.todaysBookings ?? [];
  const activeSessions = data?.activeSessions ?? [];

  const employeeNameMap = new Map(employeeStatuses.map((e) => [e.id, e.fullName]));

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <label className="text-sm text-[hsl(var(--muted-foreground))]">{t('dateLabel')}</label>
          <DateInput
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>

        {isError && (
          <p className="text-sm text-red-500">{t('loadFailed')}</p>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          {!isLoading && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {t('totalRevenue')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {stats ? formatCurrency(parseFloat(stats.totalRevenue)) : '—'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {t('totalTips')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {stats ? formatCurrency(parseFloat(stats.totalTips)) : '—'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {t('customersServed')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.customersServed ?? '—'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    {t('activeSessions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{activeSessions.length}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t('employeeStatus')}</h2>
          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
              ))}
            </div>
          )}
          {!isLoading && employeeStatuses.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noEmployees')}</p>
          )}
          {!isLoading && employeeStatuses.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {employeeStatuses.map((emp: EmployeeStatusEntry) => (
                <Card key={emp.id} className="p-4">
                  <p className="text-sm font-medium truncate">{emp.fullName}</p>
                  <div className="mt-2">
                    <Badge className={WORK_STATUS_CLASS[emp.workStatus]}>
                      {tWorkStatus(emp.workStatus)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t('todaysBookings')}</h2>
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
              ))}
            </div>
          )}
          {!isLoading && todaysBookings.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noBookings')}</p>
          )}
          {!isLoading && todaysBookings.length > 0 && (
            <div className="rounded-md border border-[hsl(var(--border))]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                    <th className="px-4 py-3 text-left font-medium">{t('columns.time')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('columns.employee')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('columns.status')}</th>
                    <th className="px-4 py-3 text-right font-medium">{t('columns.amount')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('columns.notes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {todaysBookings.map((booking: TodayBooking) => (
                    <tr key={booking.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                      <td className="px-4 py-3">
                        {booking.startTime} – {booking.endTime}
                      </td>
                      <td className="px-4 py-3">
                        {employeeNameMap.get(booking.employeeId) ?? booking.employeeId}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{booking.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {booking.totalAmount ? formatCurrency(parseFloat(booking.totalAmount)) : '—'}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {booking.notes ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t('activeSessions')}</h2>
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
              ))}
            </div>
          )}
          {!isLoading && activeSessions.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noActiveSessions')}</p>
          )}
          {!isLoading && activeSessions.length > 0 && (
            <div className="space-y-2">
              {activeSessions.map((session: ActiveSession) => (
                <Card key={session.id} className="flex items-center justify-between px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {session.sessionNumber ? `#${session.sessionNumber}` : session.id}
                      {' · '}
                      {employeeNameMap.get(session.employeeId) ?? session.employeeId}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {t('started')} {new Date(session.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <SessionStatusBadge status={session.status} />
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
