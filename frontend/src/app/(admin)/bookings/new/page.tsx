'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createBookingSchema, type CreateBookingFormData } from '@/schemas/booking.schema';
import { useCreateBooking, useBookingAvailability, useNextBookingNumber } from '@/hooks/use-bookings';
import { useServices, useServiceCategories } from '@/hooks/use-services';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { CustomerSearchSelect } from '@/components/bookings/customer-search-select';
import { CreateCustomerModal } from '@/components/bookings/create-customer-modal';
import { BOOKINGS_PATH } from '@/constants/booking.constants';
import type { AvailableEmployee } from '@/types/booking';
import type { Service } from '@/types/service';
import type { Customer } from '@/types/customer';
import { cn, formatCurrency } from '@/lib/utils';

const GUAM_TIMEZONE = 'Pacific/Guam';
const DEFAULT_DURATION_MINUTES = 60;
const START_TIME_OFFSET_MINUTES = 30;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const SERVICES_FETCH_LIMIT = 100;
const TIME_INTERVAL_MINUTES = 10;

function todayGuam(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: GUAM_TIMEZONE });
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * MINUTES_PER_HOUR + m + minutes;
  const newH = Math.floor(total / MINUTES_PER_HOUR) % HOURS_PER_DAY;
  const newM = total % MINUTES_PER_HOUR;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function defaultStartTime(): string {
  const now = new Date();
  const current = now.toLocaleTimeString('en-GB', {
    timeZone: GUAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [h, m] = current.split(':').map(Number);
  const total = Math.ceil((h * MINUTES_PER_HOUR + m + START_TIME_OFFSET_MINUTES) / TIME_INTERVAL_MINUTES) * TIME_INTERVAL_MINUTES;
  const newH = Math.floor(total / MINUTES_PER_HOUR) % HOURS_PER_DAY;
  const newM = total % MINUTES_PER_HOUR;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function calcEndTime(startTime: string, selectedServices: Service[]): string {
  const totalMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  return addMinutesToTime(startTime, totalMinutes > 0 ? totalMinutes : DEFAULT_DURATION_MINUTES);
}

export default function NewBookingPage() {
  const t = useTranslations('bookings');
  const router = useRouter();

  const { mutate: createBooking, isPending, isError, error } = useCreateBooking();
  const { data: servicesResponse } = useServices({ isActive: true, limit: SERVICES_FETCH_LIMIT });
  const services: Service[] = servicesResponse?.data ?? [];
  const { data: categoriesResponse } = useServiceCategories({ isActive: true });
  const categories = categoriesResponse?.data ?? [];

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<AvailableEmployee | null>(null);

  const initialStartTime = defaultStartTime();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      bookingDate: todayGuam(),
      startTime: initialStartTime,
      endTime: addMinutesToTime(initialStartTime, DEFAULT_DURATION_MINUTES),
      serviceIds: [],
      employeeId: '',
    },
  });

  const watchedDate = useWatch({ control, name: 'bookingDate' });
  const watchedStartTime = useWatch({ control, name: 'startTime' });
  const watchedEndTime = useWatch({ control, name: 'endTime' });
  const { data: nextBookingNumber } = useNextBookingNumber(watchedDate ?? '');

  const availabilityEnabled = Boolean(watchedDate && watchedStartTime && watchedEndTime);

  const {
    data: availableEmployees,
    isLoading: isCheckingAvailability,
    isError: availabilityError,
  } = useBookingAvailability(
    { date: watchedDate ?? '', startTime: watchedStartTime ?? '', endTime: watchedEndTime ?? '' },
    availabilityEnabled,
  );

  useEffect(() => {
    setSelectedEmployee(null);
    setValue('employeeId', '');
  }, [watchedDate, watchedStartTime, watchedEndTime, setValue]);

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    const next = isSelected
      ? selectedServices.filter((s) => s.id !== service.id)
      : [...selectedServices, service];

    setSelectedServices(next);
    setValue('serviceIds', next.map((s) => s.id), { shouldValidate: true });

    const currentStart = getValues('startTime');
    if (currentStart) {
      setValue('endTime', calcEndTime(currentStart, next));
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setValue('startTime', newStart);
    if (newStart) {
      setValue('endTime', calcEndTime(newStart, selectedServices));
    }
  };

  const handleSelectEmployee = (employee: AvailableEmployee) => {
    setSelectedEmployee(employee);
    setValue('employeeId', employee.id, { shouldValidate: true });
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer?.id ?? undefined);
  };

  const handleCustomerCreated = (customer: Customer) => {
    handleCustomerChange(customer);
  };

  const onSubmit = (data: CreateBookingFormData) => {
    createBooking(data, {
      onSuccess: () => router.push(BOOKINGS_PATH),
    });
  };

  return (
    <>
      <Header title={t('newBooking')} />
      <div className="p-6 max-w-lg space-y-6">
        <Link
          href={BOOKINGS_PATH}
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          Back to bookings
        </Link>

        {isError && (
          <div className="rounded-md border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : 'Failed to create booking.'}
          </div>
        )}

        <CreateCustomerModal
          open={createCustomerOpen}
          onOpenChange={setCreateCustomerOpen}
          onCreated={handleCustomerCreated}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Customer */}
          <div className="space-y-2">
            <Label>Customer <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">(optional — leave empty for guest)</span></Label>
            <CustomerSearchSelect
              value={selectedCustomer}
              onChange={handleCustomerChange}
              onCreateClick={() => setCreateCustomerOpen(true)}
            />
          </div>

          {/* Booking Number */}
          <div className="space-y-2">
            <Label htmlFor="bookingNumber">Booking Number</Label>
            <Input
              id="bookingNumber"
              disabled
              value={nextBookingNumber ?? '—'}
              className="text-[hsl(var(--muted-foreground))] cursor-not-allowed"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="bookingDate">Booking Date</Label>
            <Controller
              name="bookingDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  id="bookingDate"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.bookingDate && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.bookingDate.message}</p>
            )}
          </div>

          {/* Services multi-select */}
          <div className="space-y-2">
            <Label>Services</Label>
            {services.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No active services found.</p>
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
                      All
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
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
                <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))] max-h-52 overflow-y-auto">
                {services.filter((svc) =>
                  (activeCategoryId === null || svc.categoryId === activeCategoryId) &&
                  svc.name.toLowerCase().includes(serviceSearch.toLowerCase())
                ).map((svc) => {
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
            {selectedServices.length > 0 && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected ·{' '}
                {selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0)} min ·{' '}
                <span className="font-medium text-[hsl(var(--foreground))]">
                  {formatCurrency(selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0))}
                </span>
              </p>
            )}
            {errors.serviceIds && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {typeof errors.serviceIds.message === 'string'
                  ? errors.serviceIds.message
                  : 'At least one service required'}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
                onChange={handleStartTimeChange}
              />
              {errors.startTime && (
                <p className="text-xs text-[hsl(var(--destructive))]">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">
                End Time
                {selectedServices.length > 0 && (
                  <span className="ml-1 text-xs font-normal text-[hsl(var(--muted-foreground))]">(suggested)</span>
                )}
              </Label>
              <Input id="endTime" type="time" {...register('endTime')} />
              {errors.endTime && (
                <p className="text-xs text-[hsl(var(--destructive))]">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {availabilityError && (
            <p className="text-sm text-[hsl(var(--destructive))]">
              Failed to check availability. Try again.
            </p>
          )}

          {availabilityEnabled && (
            <div className="space-y-2">
              <Label>Available Technicians</Label>
              {isCheckingAvailability ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
                  ))}
                </div>
              ) : availableEmployees !== undefined && availableEmployees.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  No technicians available for the selected time slot.
                </p>
              ) : availableEmployees !== undefined ? (
                <div className="grid gap-2">
                  {availableEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      disabled={!emp.available}
                      onClick={() => emp.available && handleSelectEmployee(emp)}
                      className={cn(
                        'flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
                        !emp.available
                          ? 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] opacity-60 cursor-not-allowed'
                          : selectedEmployee?.id === emp.id
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                            : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]',
                      )}
                    >
                      <span className={cn('font-medium', !emp.available && 'text-[hsl(var(--muted-foreground))]')}>
                        {emp.fullName}
                      </span>
                      {!emp.available && emp.busyUntil && (
                        <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
                          Busy until {emp.busyUntil}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
              {errors.employeeId && (
                <p className="text-xs text-[hsl(var(--destructive))]">{errors.employeeId.message}</p>
              )}
            </div>
          )}

          <input type="hidden" {...register('employeeId')} />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder="Any additional notes..."
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
            {errors.notes && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Booking'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={BOOKINGS_PATH}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
