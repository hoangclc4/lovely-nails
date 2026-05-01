'use client';

import { useTranslations } from 'next-intl';
import { EMPLOYEE_WORK_STATUS } from '@/constants/employee.constants';
import type { EmployeeWorkStatus } from '@/types/employee';
import type { BadgeProps } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployeeStatuses } from '@/hooks/use-employees';
import { useClockIn, useClockOut, useBreakStart, useBreakEnd } from '@/hooks/use-shifts';

const WORK_STATUS_VARIANTS: Record<EmployeeWorkStatus, BadgeProps['variant']> = {
  [EMPLOYEE_WORK_STATUS.FREE]: 'success',
  [EMPLOYEE_WORK_STATUS.BUSY]: 'warning',
  [EMPLOYEE_WORK_STATUS.ON_BREAK]: 'warning',
  [EMPLOYEE_WORK_STATUS.OFF]: 'secondary',
};

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployeeStatusBoard() {
  const t = useTranslations('timeTracking');
  const tWorkStatus = useTranslations('workStatus');
  const { data: statusResponse, isLoading, isError } = useEmployeeStatuses();
  const employees = statusResponse?.data ?? [];
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const breakStart = useBreakStart();
  const breakEnd = useBreakEnd();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)] p-4 text-sm text-[hsl(var(--destructive))]">
        {t('boardLoadFailed')}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t('boardNoData')}
      </div>
    );
  }

  const isOff = (workStatus: EmployeeWorkStatus) => workStatus === EMPLOYEE_WORK_STATUS.OFF;
  const isFree = (workStatus: EmployeeWorkStatus) => workStatus === EMPLOYEE_WORK_STATUS.FREE;
  const isOnBreak = (workStatus: EmployeeWorkStatus) => workStatus === EMPLOYEE_WORK_STATUS.ON_BREAK;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {employees.map((employee) => {
        const isPending =
          clockIn.isPending ||
          clockOut.isPending ||
          breakStart.isPending ||
          breakEnd.isPending;

        return (
          <Card key={employee.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{employee.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={WORK_STATUS_VARIANTS[employee.workStatus]}>
                {tWorkStatus(employee.workStatus)}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {isOff(employee.workStatus) && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => clockIn.mutate({ employeeId: employee.id })}
                  >
                    {t('clockIn')}
                  </Button>
                )}
                {(isFree(employee.workStatus) || isOnBreak(employee.workStatus)) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => clockOut.mutate({ employeeId: employee.id })}
                  >
                    {t('clockOut')}
                  </Button>
                )}
                {isFree(employee.workStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => breakStart.mutate({ employeeId: employee.id })}
                  >
                    {t('startBreak')}
                  </Button>
                )}
                {isOnBreak(employee.workStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => breakEnd.mutate({ employeeId: employee.id })}
                  >
                    {t('endBreak')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployeeStatusBoard() {
  const { data: statusResponse, isLoading, isError } = useEmployeeStatuses();
  const employees = statusResponse?.data ?? [];
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const breakStart = useBreakStart();
  const breakEnd = useBreakEnd();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)] p-4 text-sm text-[hsl(var(--destructive))]">
        Failed to load employee statuses.
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No employees found.
      </div>
    );
  }

  const isOff = (workStatus: EmployeeWorkStatus) => workStatus === EMPLOYEE_WORK_STATUS.OFF;
  const isFree = (workStatus: EmployeeWorkStatus) => workStatus === EMPLOYEE_WORK_STATUS.FREE;
  const isOnBreak = (workStatus: EmployeeWorkStatus) => workStatus === EMPLOYEE_WORK_STATUS.ON_BREAK;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {employees.map((employee) => {
        const isPending =
          clockIn.isPending ||
          clockOut.isPending ||
          breakStart.isPending ||
          breakEnd.isPending;

        return (
          <Card key={employee.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{employee.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={WORK_STATUS_VARIANTS[employee.workStatus]}>
                {WORK_STATUS_LABELS[employee.workStatus]}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {isOff(employee.workStatus) && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => clockIn.mutate({ employeeId: employee.id })}
                  >
                    Clock In
                  </Button>
                )}
                {(isFree(employee.workStatus) || isOnBreak(employee.workStatus)) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => clockOut.mutate({ employeeId: employee.id })}
                  >
                    Clock Out
                  </Button>
                )}
                {isFree(employee.workStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => breakStart.mutate({ employeeId: employee.id })}
                  >
                    Start Break
                  </Button>
                )}
                {isOnBreak(employee.workStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => breakEnd.mutate({ employeeId: employee.id })}
                  >
                    End Break
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
