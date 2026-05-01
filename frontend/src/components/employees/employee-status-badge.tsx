'use client';

import { useTranslations } from 'next-intl';
import { EMPLOYEE_STATUS } from '@/constants/employee.constants';
import type { EmployeeStatus } from '@/types/employee';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

const STATUS_VARIANTS: Record<EmployeeStatus, BadgeProps['variant']> = {
  [EMPLOYEE_STATUS.ACTIVE]: 'success',
  [EMPLOYEE_STATUS.INACTIVE]: 'destructive',
  [EMPLOYEE_STATUS.ON_LEAVE]: 'warning',
};

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const t = useTranslations('employeeStatus');
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {t(status)}
    </Badge>
  );
}
