'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTip } from '@/hooks/use-tips';
import { useEmployees } from '@/hooks/use-employees';
import { useSessions } from '@/hooks/use-sessions';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTipSchema, type CreateTipDto } from '@/schemas/tip.schema';
import { useTranslations } from 'next-intl';
import { TIP_PAYMENT_METHOD, TIP_PAYMENT_METHOD_LABEL, TIP_PATHS } from '@/constants/tip.constants';
import { formatDateTime } from '@/lib/utils';

const NO_SESSION_VALUE = '';
const NO_EMPLOYEE_VALUE = '';
const NO_PAYMENT_METHOD_VALUE = '';

export default function NewTipPage() {
  const router = useRouter();
  const t = useTranslations('tips');
  const tCommon = useTranslations('common');
  const createTip = useCreateTip();
  const { data: employeesData } = useEmployees();
  const { data: sessionsData } = useSessions();

  const employees = employeesData?.data ?? [];
  const sessions = sessionsData?.data ?? [];

  const form = useForm<CreateTipDto>({
    resolver: zodResolver(createTipSchema),
    defaultValues: {
      note: '',
    },
  });

  const handleSubmit = (data: CreateTipDto) => {
    createTip.mutate(data, {
      onSuccess: () => router.push(TIP_PATHS.ROOT),
    });
  };

  return (
    <>
      <Header title={t('addTip')} />
      <div className="p-6 max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.sessionId')}</label>
            <Select
              value={form.watch('sessionId') ?? NO_SESSION_VALUE}
              onValueChange={(val) => form.setValue('sessionId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectSession')} />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {`${session.customerName ?? t('form.unknownCustomer')} — ${formatDateTime(session.startTime)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.sessionId && (
              <p className="text-xs text-red-500">{form.formState.errors.sessionId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.employee')}</label>
            <Select
              value={form.watch('employeeId') ?? NO_EMPLOYEE_VALUE}
              onValueChange={(val) => form.setValue('employeeId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectEmployee')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.employeeId && (
              <p className="text-xs text-red-500">{form.formState.errors.employeeId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.amountUsd')}</label>
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
            <label className="text-sm font-medium">{t('form.paymentMethod')}</label>
            <Select
              value={form.watch('paymentMethod') ?? NO_PAYMENT_METHOD_VALUE}
              onValueChange={(val) =>
                form.setValue('paymentMethod', val as CreateTipDto['paymentMethod'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectPaymentMethod')} />
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
            <label className="text-sm font-medium">{t('form.note')}</label>
            <textarea
              {...form.register('note')}
              rows={3}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createTip.isPending}>
              {createTip.isPending ? t('form.saving') : t('form.recordTip')}
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
