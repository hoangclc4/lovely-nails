'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import type { CreateEmployeeDto } from '@/schemas/employee.schema';
import { EMPLOYEE_STATUS } from '@/constants/employee.constants';
import {
  useEmployee,
  useUpdateEmployee,
  useUpdateEmployeeStatus,
} from '@/hooks/use-employees';
import { EmployeeForm } from '@/components/employees/employee-form';
import { EmployeeStatusBadge } from '@/components/employees/employee-status-badge';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const t = useTranslations('employees');
  const tStatus = useTranslations('employeeStatus');

  const { id } = use(params);

  const { data: employeeResponse, isLoading, isError, error } = useEmployee(id);
  const employee = employeeResponse?.data;
  const { mutate: updateEmployee, isPending: isUpdating, error: updateError } = useUpdateEmployee(id);
  const { mutate: updateStatus, isPending: isDeactivating } = useUpdateEmployeeStatus(id);

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-4">
          <div className="h-40 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          <div className="h-80 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
        </div>
      </>
    );
  }

  if (isError || !employee) {
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

  const handleUpdate = (data: CreateEmployeeDto) => {
    updateEmployee(data);
  };

  const handleDeactivate = () => {
    updateStatus({ status: EMPLOYEE_STATUS.INACTIVE });
  };

  const handleActivate = () => {
    updateStatus({ status: EMPLOYEE_STATUS.ACTIVE });
  };

  return (
    <>
      <Header title={employee.fullName} />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Full Name</span>
                <p className="font-medium">{employee.fullName}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Phone</span>
                <p className="font-medium">{employee.phone}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Email</span>
                <p className="font-medium">{employee.email ?? '—'}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Role</span>
                <p className="font-medium capitalize">{employee.role}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Hire Date</span>
                <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Revenue Share</span>
                <p className="font-medium">{employee.revenueSharePct}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Status:</span>
                <EmployeeStatusBadge status={employee.status} />
              </div>
            </div>

            {employee.status === EMPLOYEE_STATUS.ACTIVE && (
              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeactivating}
                  onClick={handleDeactivate}
                >
                  {isDeactivating ? 'Deactivating...' : 'Deactivate Employee'}
                </Button>
              </div>
            )}

            {employee.status !== EMPLOYEE_STATUS.ACTIVE && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeactivating}
                  onClick={handleActivate}
                >
                  {isDeactivating ? 'Activating...' : 'Activate Employee'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Employee</CardTitle>
          </CardHeader>
          <CardContent>
            {updateError && (
              <div className="mb-4 rounded-md border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
                {updateError instanceof Error ? updateError.message : 'Failed to update employee.'}
              </div>
            )}
            <EmployeeForm
              defaultValues={{
                fullName: employee.fullName,
                phone: employee.phone,
                email: employee.email,
                revenueSharePct: employee.revenueSharePct,
              }}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
