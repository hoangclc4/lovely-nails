'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useEmployees } from '@/hooks/use-employees';
import { useSalaries, useGenerateSalary } from '@/hooks/use-salaries';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateSalarySchema, type GenerateSalaryDto } from '@/schemas/salary.schema';
import {
  SALARY_STATUS,
  SALARY_STATUS_LABEL,
  ALL_STATUSES_VALUE,
  SALARY_PATHS,
} from '@/constants/salary.constants';
import { useTranslations } from 'next-intl';
import type { SalaryListParams, SalaryStatus } from '@/types/salary';

const ALL_EMPLOYEES_VALUE = 'all';

const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
type MonthValue = (typeof MONTH_VALUES)[number];

const STATUS_BADGE_CLASS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const CURRENT_YEAR = new Date().getFullYear();

export default function SalariesPage() {
  const t = useTranslations('salaries');
  const tStatus = useTranslations('salaryStatus');
  const tCommon = useTranslations('common');
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<SalaryStatus | undefined>(undefined);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const params: SalaryListParams = { employeeId, month, year, status };

  const { data: salariesData, isLoading, isError } = useSalaries(params);
  const { data: employeesData } = useEmployees();
  const generateSalary = useGenerateSalary();

  const salaries = [...(salariesData?.data ?? [])].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );

  const groupedSalaries = salaries.reduce<{ key: string; label: string; items: typeof salaries }[]>(
    (acc, salary) => {
      const key = `${salary.year}-${salary.month}`;
      const existing = acc.find((g) => g.key === key);
      if (existing) {
        existing.items.push(salary);
        return acc;
      }
      acc.push({ key, label: `${t(`months.${salary.month as MonthValue}`)} ${salary.year}`, items: [salary] });
      return acc;
    },
    [],
  );
  const employees = employeesData?.data ?? [];

  const employeeNameById = new Map(employees.map((emp) => [emp.id, emp.fullName]));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerateSalaryDto>({
    resolver: zodResolver(generateSalarySchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
    },
  });

  const handleEmployeeChange = (val: string) => {
    setEmployeeId(val === ALL_EMPLOYEES_VALUE ? undefined : val);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val === ALL_STATUSES_VALUE ? undefined : (val as SalaryStatus));
  };

  const handleMonthChange = (val: string) => {
    setMonth(val === ALL_STATUSES_VALUE ? undefined : Number(val));
  };

  const hasActiveFilters = employeeId !== undefined || month !== undefined || year !== undefined || status !== undefined;

  const handleClearFilters = () => {
    setEmployeeId(undefined);
    setMonth(undefined);
    setYear(undefined);
    setStatus(undefined);
  };

  const handleGenerateSubmit = (data: GenerateSalaryDto) => {
    generateSalary.mutate(data, {
      onSuccess: () => {
        setIsGenerateOpen(false);
        reset();
      },
    });
  };

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('allEmployees')}</label>
            <Select
              value={employeeId ?? ALL_EMPLOYEES_VALUE}
              onValueChange={handleEmployeeChange}
            >
              <SelectTrigger className="w-44">
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
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('month')}</label>
            <Select
              value={month !== undefined ? String(month) : ALL_STATUSES_VALUE}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('month')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES_VALUE}>{t('month')}</SelectItem>
                {MONTH_VALUES.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {t(`months.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('year')}</label>
            <input
              type="number"
              value={year ?? ''}
              onChange={(e) => setYear(e.target.value.length > 0 ? Number(e.target.value) : undefined)}
              placeholder={String(CURRENT_YEAR)}
              className="h-9 w-24 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('allStatuses')}</label>
            <Select
              value={status ?? ALL_STATUSES_VALUE}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES_VALUE}>{t('allStatuses')}</SelectItem>
                {Object.values(SALARY_STATUS).map((s) => (
                  <SelectItem key={s} value={s}>
                    {tStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              {tCommon('actions.clearFilters')}
            </Button>
          )}

          <div className="ml-auto">
            <Button onClick={() => setIsGenerateOpen(true)}>{t('generateSalaries')}</Button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-red-500">{t('loadFailed')}</p>
        )}

        {!isLoading && !isError && salaries.length === 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noRecords')}</p>
        )}

        {!isLoading && !isError && salaries.length > 0 && (
          <div className="rounded-md border border-[hsl(var(--border))]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="px-4 py-3 text-left font-medium">{t('columns.employee')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.period')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.status')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.netPay')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.grossPay')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.revenue')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.tips')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {groupedSalaries.map((group) => (
                  <Fragment key={group.key}>
                    <tr className="bg-[hsl(var(--muted)/0.5)]">
                      <td colSpan={8} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                        {group.label}
                      </td>
                    </tr>
                    {group.items.map((salary) => (
                      <tr key={salary.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                        <td className="px-4 py-3">
                          {employeeNameById.get(salary.employeeId) ?? salary.employeeId}
                        </td>
                        <td className="px-4 py-3">
                          {t(`months.${salary.month as MonthValue}`)} {salary.year}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_BADGE_CLASS[salary.status] ?? ''}>
                            {tStatus(salary.status) ?? salary.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(parseFloat(salary.netPay))}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(parseFloat(salary.grossPay))}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(parseFloat(salary.totalServiceRevenue))}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(parseFloat(salary.totalTips))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={SALARY_PATHS.DETAIL(salary.id)}>
                            <Button size="sm" variant="outline">
                              {t('view')}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isGenerateOpen} onOpenChange={(open) => { if (!open) { setIsGenerateOpen(false); reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('generateSalaries')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleGenerateSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('month')}</label>
              <select
                {...register('month', { valueAsNumber: true })}
                className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                {MONTH_VALUES.map((m) => (
                  <option key={m} value={m}>
                    {t(`months.${m}`)}
                  </option>
                ))}
              </select>
              {errors.month && (
                <p className="text-xs text-red-500">{errors.month.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('year')}</label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {errors.year && (
                <p className="text-xs text-red-500">{errors.year.message}</p>
              )}
            </div>

            {generateSalary.isError && (
              <p className="text-sm text-red-500">
                {generateSalary.error instanceof Error
                  ? generateSalary.error.message
                  : t('loadFailed')}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={generateSalary.isPending}>
                {generateSalary.isPending ? t('generating') : t('generate')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsGenerateOpen(false); reset(); }}
              >
                {tCommon('actions.cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
