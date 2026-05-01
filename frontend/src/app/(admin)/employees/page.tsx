'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { EMPLOYEE_STATUS } from '@/constants/employee.constants';
import type { EmployeeStatus } from '@/types/employee';
import { useEmployees } from '@/hooks/use-employees';
import { EmployeeTable } from '@/components/employees/employee-table';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEBOUNCE_MS = 300;
const ALL_STATUSES_VALUE = 'all';

const EMPLOYEE_STATUS_VALUES = [
  ALL_STATUSES_VALUE,
  EMPLOYEE_STATUS.ACTIVE,
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.ON_LEAVE,
] as const;

export default function EmployeesPage() {
  const t = useTranslations('employees');
  const tStatus = useTranslations('employeeStatus');
  const tCommon = useTranslations('common');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchFromUrl = searchParams.get('search') ?? '';
  const statusFromUrl = (searchParams.get('status') as EmployeeStatus | null) ?? undefined;

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, error } = useEmployees({
    search: searchFromUrl || undefined,
    status: statusFromUrl,
  });

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      updateUrlParam('search', value || undefined);
    }, DEBOUNCE_MS);

    setDebounceTimer(timer);
  };

  const handleStatusChange = (value: string) => {
    const status = value === ALL_STATUSES_VALUE ? undefined : (value as EmployeeStatus);
    updateUrlParam('status', status);
  };

  const hasActiveFilters = !!(searchFromUrl || statusFromUrl);

  const handleClearFilters = () => {
    setSearchInput('');
    if (debounceTimer) clearTimeout(debounceTimer);
    router.push(pathname);
  };

  if (isError) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6">
          <p className="text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : t('loadFailed')}
          </p>
        </div>
      </>
    );
  }

  const employees = data?.data ?? [];

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
            <Select
              value={statusFromUrl ?? ALL_STATUSES_VALUE}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_STATUS_VALUES.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val === ALL_STATUSES_VALUE ? tStatus('allStatuses') : tStatus(val)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                {tCommon('actions.clearFilters')}
              </Button>
            )}
          </div>

          <Button asChild>
            <Link href="/employees/new">{t('addEmployee')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]"
              />
            ))}
          </div>
        ) : (
          <EmployeeTable employees={employees} />
        )}

        {data && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {data.meta.total} employee{data.meta.total !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    </>
  );
}
