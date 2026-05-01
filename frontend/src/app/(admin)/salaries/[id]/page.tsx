'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useSalaryDetail,
  useSalaryPayslip,
  useAddAdjustment,
  useConfirmSalary,
  useMarkPaidSalary,
} from '@/hooks/use-salaries';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addAdjustmentSchema, type AddAdjustmentDto } from '@/schemas/salary.schema';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  SALARY_STATUS,
  SALARY_STATUS_LABEL,
  ADJUSTMENT_TYPE,
  ADJUSTMENT_TYPE_LABEL,
  SALARY_PATHS,
} from '@/constants/salary.constants';

const STATUS_BADGE_CLASS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
type MonthValue = (typeof MONTH_VALUES)[number];

export default function SalaryDetailPage() {
  const params = useParams();
  const t = useTranslations('salaries');
  const tStatus = useTranslations('salaryStatus');
  const tCommon = useTranslations('common');
  const id = typeof params.id === 'string' ? params.id : '';

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  const { data: detailData, isLoading: isDetailLoading, isError: isDetailError } = useSalaryDetail(id);
  const { data: payslipData, isLoading: isPayslipLoading, isError: isPayslipError } = useSalaryPayslip(id);

  const addAdjustment = useAddAdjustment(id);
  const confirmSalary = useConfirmSalary();
  const markPaidSalary = useMarkPaidSalary();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddAdjustmentDto>({
    resolver: zodResolver(addAdjustmentSchema),
    defaultValues: {
      type: ADJUSTMENT_TYPE.BONUS,
      amount: 0,
      reason: '',
    },
  });

  const isLoading = isDetailLoading || isPayslipLoading;
  const isError = isDetailError || isPayslipError;

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isError || detailData === undefined || payslipData === undefined) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6">
          <p className="text-sm text-red-500">{t('detail.loadFailed')}</p>
          <Link href={SALARY_PATHS.LIST} className="mt-4 inline-block text-sm text-[hsl(var(--primary))] underline">
            {t('detail.backToSalaries')}
          </Link>
        </div>
      </>
    );
  }

  const { salary, adjustments } = detailData.data;
  const { employeeName } = payslipData.data;

  const monthName = t(`months.${salary.month as MonthValue}`);

  const handleAdjustmentSubmit = (data: AddAdjustmentDto) => {
    addAdjustment.mutate(data, {
      onSuccess: () => {
        setIsAdjustmentOpen(false);
        reset();
      },
    });
  };

  const handleConfirm = () => {
    confirmSalary.mutate(id);
  };

  const handleMarkPaid = () => {
    markPaidSalary.mutate(id);
  };

  return (
    <>
      <Header title={t('detail.title')} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={SALARY_PATHS.LIST} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            {t('detail.backToSalaries')}
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{employeeName}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {monthName} {salary.year}
            </p>
          </div>
          <Badge className={STATUS_BADGE_CLASS[salary.status] ?? ''}>
            {tStatus(salary.status) ?? salary.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-[hsl(var(--border))] p-4 space-y-3">
            <h3 className="text-sm font-semibold">{t('detail.revenueBreakdown')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.totalSessions')}</span>
                <span>{salary.totalServicesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.totalServiceRevenue')}</span>
                <span>{formatCurrency(parseFloat(salary.totalServiceRevenue))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.revenueSharePct')}</span>
                <span>{parseFloat(salary.revenueSharePctSnapshot).toLocaleString()}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.technicianShare')}</span>
                <span className="font-medium">{formatCurrency(parseFloat(salary.technicianRevenueShare))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.ownerShare')}</span>
                <span>{formatCurrency(parseFloat(salary.ownerRevenueShare))}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-[hsl(var(--border))] p-4 space-y-3">
            <h3 className="text-sm font-semibold">{t('detail.paySummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.tips')}</span>
                <span>{formatCurrency(parseFloat(salary.totalTips))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.bonuses')}</span>
                <span>{formatCurrency(parseFloat(salary.bonuses))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.deductions')}</span>
                <span className="text-red-600">-{formatCurrency(parseFloat(salary.deductions))}</span>
              </div>
              <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.grossPay')}</span>
                <span>{formatCurrency(parseFloat(salary.grossPay))}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t('detail.netPay')}</span>
                <span className="font-semibold text-[hsl(var(--primary))]">
                  {formatCurrency(parseFloat(salary.netPay))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t('detail.adjustments')}</h3>
            <Button size="sm" variant="outline" onClick={() => setIsAdjustmentOpen(true)}>
              {t('detail.addAdjustment')}
            </Button>
          </div>

          {adjustments.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.noAdjustments')}</p>
          )}

          {adjustments.length > 0 && (
            <div className="rounded-md border border-[hsl(var(--border))]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                    <th className="px-4 py-3 text-left font-medium">{t('adjustmentColumns.type')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('adjustmentColumns.amount')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('adjustmentColumns.reason')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('adjustmentColumns.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                      <td className="px-4 py-3">
                        {ADJUSTMENT_TYPE_LABEL[adj.type]}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(parseFloat(adj.amount))}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {adj.reason}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {new Date(adj.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={salary.status !== SALARY_STATUS.DRAFT || confirmSalary.isPending}
          >
            {confirmSalary.isPending ? t('detail.confirming') : t('actions.confirm')}
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkPaid}
            disabled={salary.status !== SALARY_STATUS.CONFIRMED || markPaidSalary.isPending}
          >
            {markPaidSalary.isPending ? t('detail.updating') : t('actions.markPaid')}
          </Button>
        </div>

        {(confirmSalary.isError || markPaidSalary.isError) && (
          <p className="text-sm text-red-500">
            {confirmSalary.isError && confirmSalary.error instanceof Error
              ? confirmSalary.error.message
              : markPaidSalary.isError && markPaidSalary.error instanceof Error
                ? markPaidSalary.error.message
                : 'An error occurred.'}
          </p>
        )}
      </div>

      <Dialog
        open={isAdjustmentOpen}
        onOpenChange={(open) => { if (!open) { setIsAdjustmentOpen(false); reset(); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('adjustmentDialog.title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAdjustmentSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('adjustmentDialog.type')}</label>
              <select
                {...register('type')}
                className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                {Object.values(ADJUSTMENT_TYPE).map((t) => (
                  <option key={t} value={t}>
                    {ADJUSTMENT_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('adjustmentDialog.amountVnd')}</label>
              <input
                type="number"
                step="1000"
                min="0"
                {...register('amount', { valueAsNumber: true })}
                className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('adjustmentDialog.reason')}</label>
              <textarea
                {...register('reason')}
                rows={3}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {errors.reason && (
                <p className="text-xs text-red-500">{errors.reason.message}</p>
              )}
            </div>

            {addAdjustment.isError && (
              <p className="text-sm text-red-500">
                {addAdjustment.error instanceof Error
                  ? addAdjustment.error.message
                  : t('adjustmentDialog.addFailed')}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={addAdjustment.isPending}>
                {addAdjustment.isPending ? t('adjustmentDialog.adding') : t('adjustmentDialog.addAdjustment')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsAdjustmentOpen(false); reset(); }}
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
