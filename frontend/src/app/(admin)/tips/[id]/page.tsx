'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTip, useUpdateTip } from '@/hooks/use-tips';
import { useSession } from '@/hooks/use-sessions';
import { useEmployee } from '@/hooks/use-employees';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateTipSchema, type UpdateTipDto } from '@/schemas/tip.schema';
import { formatDateTime } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { TIP_PAYMENT_METHOD, TIP_PAYMENT_METHOD_LABEL, TIP_PATHS } from '@/constants/tip.constants';

const NO_PAYMENT_METHOD_VALUE = '';

export default function TipDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('tips');
  const tCommon = useTranslations('common');
  const id = params.id;

  const { data: tipResponse, isLoading, isError } = useTip(id);
  const tip = tipResponse?.data;
  const updateTip = useUpdateTip(id);

  const { data: sessionData } = useSession(tip?.sessionId ?? '');
  const { data: employeeData } = useEmployee(tip?.employeeId ?? '');
  const session = sessionData;
  const employee = employeeData?.data;

  const form = useForm<UpdateTipDto>({
    resolver: zodResolver(updateTipSchema),
  });

  useEffect(() => {
    if (tip === undefined) return;
    form.reset({
      amount: parseFloat(tip.amount),
      paymentMethod: tip.paymentMethod,
      note: tip.note ?? '',
    });
  }, [tip, form]);

  const handleSubmit = (data: UpdateTipDto) => {
    updateTip.mutate(data, {
      onSuccess: () => router.push(TIP_PATHS.ROOT),
    });
  };

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isError || !tip) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6">
          <p className="text-sm text-red-500">{t('detail.notFound')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('editTip')} />
      <div className="p-6 max-w-lg space-y-6">
        <div className="rounded-md border border-[hsl(var(--border))] p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">{t('detail.session')}</span>
            <span className="text-sm">
              {session
                ? `#${session.sessionNumber} · ${formatDateTime(session.startTime)}`
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">{t('detail.employee')}</span>
            <span className="text-sm">{employee?.fullName ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">{t('detail.recorded')}</span>
            <span>{formatDateTime(tip.createdAt)}</span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('detail.amountUsd')}</label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              {...form.register('amount', { valueAsNumber: true })}
              className="w-full h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('detail.paymentMethod')}</label>
            <Select
              value={form.watch('paymentMethod') ?? NO_PAYMENT_METHOD_VALUE}
              onValueChange={(val) =>
                form.setValue('paymentMethod', val as UpdateTipDto['paymentMethod'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('detail.selectPaymentMethod')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TIP_PAYMENT_METHOD).map((method) => (
                  <SelectItem key={method} value={method}>
                    {TIP_PAYMENT_METHOD_LABEL[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.paymentMethod && (
              <p className="text-xs text-red-500">{form.formState.errors.paymentMethod.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('detail.note')}</label>
            <textarea
              {...form.register('note')}
              rows={3}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={updateTip.isPending}>
              {updateTip.isPending ? t('detail.saving') : t('detail.saveChanges')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(TIP_PATHS.ROOT)}
            >
              {tCommon('actions.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
