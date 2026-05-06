'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSessions } from '@/hooks/use-sessions';
import { useEmployees } from '@/hooks/use-employees';
import { SessionTable } from '@/components/sessions/session-table';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SESSION_STATUS, ALL_STATUSES_VALUE, SESSION_PATHS } from '@/constants/session.constants';
import { DateInput } from '@/components/ui/date-input';
import type { SessionStatus } from '@/types/session';

const SESSION_STATUS_VALUES = [
  ALL_STATUSES_VALUE,
  SESSION_STATUS.IN_PROGRESS,
  SESSION_STATUS.COMPLETED,
  SESSION_STATUS.CANCELLED,
] as const;

const ALL_EMPLOYEES_VALUE = 'all';

export default function SessionsPage() {
  const t = useTranslations('sessions');
  const tStatus = useTranslations('sessionStatus');
  const tCommon = useTranslations('common');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const employeeIdFromUrl = searchParams.get('employeeId') ?? undefined;
  const statusFromUrl = (searchParams.get('status') as SessionStatus | null) ?? undefined;
  const dateFromUrl = searchParams.get('dateFrom') ?? undefined;

  const { data: sessionsData, isLoading, isError, error } = useSessions({
    employeeId: employeeIdFromUrl,
    status: statusFromUrl,
    dateFrom: dateFromUrl ? `${dateFromUrl}T00:00:00` : undefined,
    dateTo: dateFromUrl ? `${dateFromUrl}T23:59:59` : undefined,
  });

  const { data: employeesData } = useEmployees();

  const updateUrlParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const handleStatusChange = (value: string) => {
    const status = value === ALL_STATUSES_VALUE ? undefined : (value as SessionStatus);
    updateUrlParam('status', status);
  };

  const handleEmployeeChange = (value: string) => {
    const id = value === ALL_EMPLOYEES_VALUE ? undefined : value;
    updateUrlParam('employeeId', id);
  };

  const handleDateChange = (value: string) => {
    updateUrlParam('dateFrom', value || undefined);
  };

  const handleTodayClick = () => {
    updateUrlParam('dateFrom', new Date().toISOString().split('T')[0]);
  };

  const hasActiveFilters = !!(dateFromUrl ?? employeeIdFromUrl ?? statusFromUrl);

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const sessions = sessionsData?.data ?? [];
  const total = sessionsData?.meta.total ?? 0;
  const employees = employeesData?.data ?? [];

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <DateInput
              value={dateFromUrl ?? ''}
              onChange={handleDateChange}
            />
            <Button variant="outline" size="sm" onClick={handleTodayClick}>
              {t('today')}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                {tCommon('actions.clearFilters')}
              </Button>
            )}
            <Select
              value={employeeIdFromUrl ?? ALL_EMPLOYEES_VALUE}
              onValueChange={handleEmployeeChange}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder={t('allEmployees')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_EMPLOYEES_VALUE}>{t('allEmployees')}</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFromUrl ?? ALL_STATUSES_VALUE}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={tStatus('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                {SESSION_STATUS_VALUES.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val === ALL_STATUSES_VALUE ? tStatus('allStatuses') : tStatus(val)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href={SESSION_PATHS.NEW}>{t('newSession')}</Link>
          </Button>
        </div>

        <SessionTable
          sessions={sessions}
          employees={employees}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
        />

        {sessionsData && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {total} session{total !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    </>
  );
}
