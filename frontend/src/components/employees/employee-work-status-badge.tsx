'use client';

import { useTranslations } from 'next-intl';
import { EMPLOYEE_WORK_STATUS } from '@/constants/employee.constants';
import type { EmployeeWorkStatus } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

const WORK_STATUS_VARIANTS: Record<EmployeeWorkStatus, BadgeProps['variant']> = {
  [EMPLOYEE_WORK_STATUS.FREE]: 'success',
  [EMPLOYEE_WORK_STATUS.BUSY]: 'warning',
  [EMPLOYEE_WORK_STATUS.ON_BREAK]: 'warning',
  [EMPLOYEE_WORK_STATUS.OFF]: 'secondary',
};

interface EmployeeWorkStatusBadgeProps {
  workStatus: EmployeeWorkStatus;
}

export function EmployeeWorkStatusBadge({ workStatus }: EmployeeWorkStatusBadgeProps) {
  const t = useTranslations('workStatus');
  return (
    <Badge variant={WORK_STATUS_VARIANTS[workStatus]}>
      {t(workStatus)}
    </Badge>
  );
}
