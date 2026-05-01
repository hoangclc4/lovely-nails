'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEmployees } from '@/hooks/use-employees';
import { useTips, useDeleteTip, useTipSummary } from '@/hooks/use-tips';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
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
import {
  TIP_PAYMENT_METHOD,
  TIP_PAYMENT_METHOD_LABEL,
  ALL_PAYMENT_METHODS_VALUE,
  TIP_PATHS,
} from '@/constants/tip.constants';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import type { TipListParams, TipPaymentMethod } from '@/types/tip';

const ALL_EMPLOYEES_VALUE = 'all';

export default function TipsPage() {
  const t = useTranslations('tips');
  const tCommon = useTranslations('common');
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<TipPaymentMethod | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params: TipListParams = {
    employeeId,
    paymentMethod,
    dateFrom: dateFrom.length > 0 ? `${dateFrom}T00:00:00` : undefined,
    dateTo: dateTo.length > 0 ? `${dateTo}T23:59:59` : undefined,
  };

  const summaryParams = {
    employeeId,
    dateFrom: dateFrom.length > 0 ? `${dateFrom}T00:00:00` : undefined,
    dateTo: dateTo.length > 0 ? `${dateTo}T23:59:59` : undefined,
  };

  const { data: tipsData, isLoading, isError } = useTips(params);
  const { data: summaryResponse } = useTipSummary(summaryParams);
  const summaryData = summaryResponse?.data;
  const { data: employeesData } = useEmployees();
  const deleteTip = useDeleteTip();

  const tips = tipsData?.data ?? [];
  const employees = employeesData?.data ?? [];
  const employeeNameById = new Map(employees.map((emp) => [emp.id, emp.fullName]));

  const handleEmployeeChange = (val: string) => {
    setEmployeeId(val === ALL_EMPLOYEES_VALUE ? undefined : val);
  };

  const handlePaymentMethodChange = (val: string) => {
    setPaymentMethod(val === ALL_PAYMENT_METHODS_VALUE ? undefined : (val as TipPaymentMethod));
  };

  const hasActiveFilters = employeeId !== undefined || paymentMethod !== undefined || dateFrom !== '' || dateTo !== '';

  const handleClearFilters = () => {
    setEmployeeId(undefined);
    setPaymentMethod(undefined);
    setDateFrom('');
    setDateTo('');
  };

  const handleDelete = () => {
    if (deletingId === null) return;
    deleteTip.mutate(deletingId, {
      onSuccess: () => setDeletingId(null),
    });
  };

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('employee')}</label>
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
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('paymentMethod')}</label>
            <Select
              value={paymentMethod ?? ALL_PAYMENT_METHODS_VALUE}
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('allMethods')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PAYMENT_METHODS_VALUE}>{t('allMethods')}</SelectItem>
                {Object.values(TIP_PAYMENT_METHOD).map((method) => (
                  <SelectItem key={method} value={method}>
                    {TIP_PAYMENT_METHOD_LABEL[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('from')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('to')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              {tCommon('actions.clearFilters')}
            </Button>
          )}

          <div className="ml-auto">
            <Link href={TIP_PATHS.NEW}>
              <Button>{t('recordTip')}</Button>
            </Link>
          </div>
        </div>

        {summaryData && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border border-[hsl(var(--border))] p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('totalTips')}</p>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(parseFloat(summaryData.totalAmount))}
              </p>
            </div>
            <div className="rounded-md border border-[hsl(var(--border))] p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('tipCount')}</p>
              <p className="mt-1 text-lg font-semibold">{summaryData.tipCount}</p>
            </div>
            <div className="rounded-md border border-[hsl(var(--border))] p-4 col-span-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{t('byPaymentMethod')}</p>
              <div className="space-y-1">
                {summaryData.byPaymentMethod.map((row) => (
                  <div key={row.paymentMethod} className="flex justify-between text-sm">
                    <span>{TIP_PAYMENT_METHOD_LABEL[row.paymentMethod] ?? row.paymentMethod}</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(row.totalAmount))} ({row.tipCount})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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

        {!isLoading && !isError && tips.length === 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noTips')}</p>
        )}

        {!isLoading && !isError && tips.length > 0 && (
          <div className="rounded-md border border-[hsl(var(--border))]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="px-4 py-3 text-left font-medium">{t('columns.date')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.employee')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.amount')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.method')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.note')}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {tips.map((tip) => (
                  <tr key={tip.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {new Date(tip.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {employeeNameById.get(tip.employeeId) ?? tip.employeeId}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(parseFloat(tip.amount))}
                    </td>
                    <td className="px-4 py-3">
                      {TIP_PAYMENT_METHOD_LABEL[tip.paymentMethod] ?? tip.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {tip.note ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={TIP_PATHS.DETAIL(tip.id)}>
                          <Button size="sm" variant="outline">
                            {tCommon('actions.edit')}
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingId(tip.id)}
                        >
                          {tCommon('actions.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('deleteDialog.message')}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTip.isPending}
            >
              {deleteTip.isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
            </Button>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              {tCommon('actions.cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
