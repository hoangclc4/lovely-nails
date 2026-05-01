'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { CreateEmployeeDto } from '@/schemas/employee.schema';
import { useCreateEmployee } from '@/hooks/use-employees';
import { EmployeeForm } from '@/components/employees/employee-form';
import { Header } from '@/components/layout/header';

const EMPLOYEES_PATH = '/employees';

export default function NewEmployeePage() {
  const t = useTranslations('employees');

  const router = useRouter();
  const { mutate: createEmployee, isPending, isError, error } = useCreateEmployee();

  const handleSubmit = (data: CreateEmployeeDto) => {
    createEmployee(data, {
      onSuccess: () => {
        router.push(EMPLOYEES_PATH);
      },
    });
  };

  return (
    <>
      <Header title={t('addEmployee')} />
      <div className="p-6 max-w-lg">
        {isError && (
          <div className="mb-4 rounded-md border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : 'Failed to create employee.'}
          </div>
        )}

        <EmployeeForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </>
  );
}
