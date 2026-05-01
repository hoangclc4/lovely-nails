'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateSession, useNextSessionNumber } from '@/hooks/use-sessions';
import { useEmployees } from '@/hooks/use-employees';
import { useServices } from '@/hooks/use-services';
import { useBookings } from '@/hooks/use-bookings';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSessionSchema, type CreateSessionDto } from '@/schemas/session.schema';
import { SESSION_PATHS } from '@/constants/session.constants';
import { BOOKING_STATUS } from '@/constants/booking.constants';

const NO_EMPLOYEE_VALUE = '';
const NO_BOOKING_VALUE = '';

export default function NewSessionPage() {
  const router = useRouter();
  const t = useTranslations('sessions');
  const createSession = useCreateSession();

  const { data: employeesData } = useEmployees();
  const { data: servicesData } = useServices({ isActive: true });
  const { data: pendingBookingsData } = useBookings({ status: BOOKING_STATUS.PENDING });

  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: nextSessionNumber } = useNextSessionNumber(todayDate);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateSessionDto>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      serviceIds: [],
    },
  });

  const employees = employeesData?.data ?? [];
  const services = servicesData?.data ?? [];
  const pendingBookings = pendingBookingsData?.data ?? [];

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      setValue('serviceIds', next, { shouldValidate: true });
      return next;
    });
  };

  const onSubmit = (data: CreateSessionDto) => {
    const payload: CreateSessionDto = {
      ...data,
      serviceIds: selectedServiceIds,
    };

    createSession.mutate(payload, {
      onSuccess: (session) => {
        router.push(SESSION_PATHS.DETAIL(session.id));
      },
    });
  };

  return (
    <>
      <Header title={t('newSession')} />
      <div className="p-6 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <Label>{t('form.sessionNumber')}</Label>
            <Input
              disabled
              value={nextSessionNumber ?? '—'}
              className="text-[hsl(var(--muted-foreground))] cursor-not-allowed font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.employee')}</label>
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select value={field.value ?? NO_EMPLOYEE_VALUE} onValueChange={field.onChange}>
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
              )}
            />
            {errors.employeeId && (
              <p className="text-xs text-red-500">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.bookingId')}</label>
            <Controller
              control={control}
              name="bookingId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NO_BOOKING_VALUE}
                  onValueChange={(val) => {
                    field.onChange(val === NO_BOOKING_VALUE ? undefined : val);
                    const booking = pendingBookings.find((b) => b.id === val);
                    if (booking) {
                      const ids = booking.serviceIds ?? [];
                      setSelectedServiceIds(ids);
                      setValue('serviceIds', ids, { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.bookingIdPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.bookingDate} {booking.startTime}–{booking.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.customerName')}</label>
            <input
              {...register('customerName')}
              placeholder={t('form.customerNamePlaceholder')}
              className="w-full h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('form.services')}</label>
            <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
              {services.length === 0 && (
                <p className="px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {t('form.noActiveServices')}
                </p>
              )}
              {services.map((svc) => (
                <label
                  key={svc.id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[hsl(var(--accent))]"
                >
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(svc.id)}
                    onChange={() => toggleService(svc.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm flex-1">{svc.name}</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatCurrency(parseFloat(String(svc.price)))}
                  </span>
                </label>
              ))}
            </div>
            {selectedServiceIds.length === 0 && errors.serviceIds && (
              <p className="text-xs text-red-500">{errors.serviceIds.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.notes')}</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          {createSession.isError && (
            <p className="text-sm text-red-500">
              {createSession.error instanceof Error
                ? createSession.error.message
                : t('form.createFailed')}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? t('form.starting') : t('form.startSession')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(SESSION_PATHS.ROOT)}
            >
              {t('cancelDialog.back')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
