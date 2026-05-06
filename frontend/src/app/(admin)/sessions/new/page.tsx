'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateSession, useNextSessionNumber } from '@/hooks/use-sessions';
import { useEmployees } from '@/hooks/use-employees';
import { useServices, useServiceCategories } from '@/hooks/use-services';
import { useBookings } from '@/hooks/use-bookings';
import { CustomerSearchSelect } from '@/components/bookings/customer-search-select';
import { CreateCustomerModal } from '@/components/bookings/create-customer-modal';
import type { Customer } from '@/types/customer';
import type { Service } from '@/types/service';
import { cn, formatCurrency } from '@/lib/utils';
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
const SERVICES_FETCH_LIMIT = 100;
const SALON_TIMEZONE = 'Pacific/Guam';

function currentTime(): string {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: SALON_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function NewSessionPage() {
  const router = useRouter();
  const t = useTranslations('sessions');
  const createSession = useCreateSession();

  const { data: employeesData } = useEmployees();
  const { data: servicesData } = useServices({ isActive: true, limit: SERVICES_FETCH_LIMIT });
  const { data: categoriesData } = useServiceCategories({ isActive: true });
  const { data: pendingBookingsData } = useBookings({ status: BOOKING_STATUS.PENDING });

  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: nextSessionNumber } = useNextSessionNumber(todayDate);

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);

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
      startTime: currentTime(),
    },
  });

  const employees = employeesData?.data ?? [];
  const services = servicesData?.data ?? [];
  const pendingBookings = pendingBookingsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    const next = isSelected
      ? selectedServices.filter((s) => s.id !== service.id)
      : [...selectedServices, service];
    setSelectedServices(next);
    setValue('serviceIds', next.map((s) => s.id), { shouldValidate: true });
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer?.id ?? undefined);
  };

  const handleCustomerCreated = (customer: Customer) => {
    handleCustomerChange(customer);
  };

  const onSubmit = (data: CreateSessionDto) => {
    const payload: CreateSessionDto = {
      ...data,
      serviceIds: selectedServices.map((s) => s.id),
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
                      const resolved = ids
                        .map((id) => services.find((s) => s.id === id))
                        .filter((s): s is Service => s !== undefined);
                      setSelectedServices(resolved);
                      setValue('serviceIds', ids, { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.bookingIdPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingBookings.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                        {t('form.noPendingBookings')}
                      </p>
                    ) : (
                      pendingBookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.bookingDate} {booking.startTime}–{booking.endTime}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t('form.customerName')}
              <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                {t('form.customerGuestHint')}
              </span>
            </label>
            <CustomerSearchSelect
              value={selectedCustomer}
              onChange={handleCustomerChange}
              onCreateClick={() => setCreateCustomerOpen(true)}
            />
          </div>
          <CreateCustomerModal
            open={createCustomerOpen}
            onOpenChange={setCreateCustomerOpen}
            onCreated={handleCustomerCreated}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('form.services')}</label>
            {services.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('form.noActiveServices')}</p>
            ) : (
              <>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveCategoryId(null)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                        activeCategoryId === null
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
                      )}
                    >
                      {t('form.categoryAll')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                          activeCategoryId === cat.id
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                            : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
                <Input
                  placeholder={t('form.searchServicesPlaceholder')}
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
                <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))] max-h-52 overflow-y-auto">
                  {services
                    .filter(
                      (svc) =>
                        (activeCategoryId === null || svc.categoryId === activeCategoryId) &&
                        svc.name.toLowerCase().includes(serviceSearch.toLowerCase()),
                    )
                    .map((svc) => {
                      const checked = selectedServices.some((s) => s.id === svc.id);
                      return (
                        <label
                          key={svc.id}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                            checked
                              ? 'bg-[hsl(var(--primary)/0.06)]'
                              : 'hover:bg-[hsl(var(--accent))]',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleService(svc)}
                            className="h-4 w-4"
                          />
                          <span className="flex-1 text-sm font-medium">{svc.name}</span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {svc.durationMinutes} min · {formatCurrency(parseFloat(svc.price))}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </>
            )}
            {selectedServices.length > 0 && (() => {
              const totalMin = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
              const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
              return (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t('form.servicesSelectedSummary', { count: selectedServices.length, minutes: totalMin })} ·{' '}
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {formatCurrency(totalPrice)}
                  </span>
                </p>
              );
            })()}
            {errors.serviceIds && (
              <p className="text-xs text-red-500">{errors.serviceIds.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.startTime')}</label>
            <Input type="time" {...register('startTime')} />
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
