'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useBookings, useBookingCalendar } from '@/hooks/use-bookings';
import { useEmployees } from '@/hooks/use-employees';
import { useServices } from '@/hooks/use-services';
import { BookingTable } from '@/components/bookings/booking-table';
import { BookingCalendar } from '@/components/bookings/booking-calendar';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
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
import { BOOKING_STATUS, ALL_STATUSES_VALUE, WEEK_LENGTH } from '@/constants/booking.constants';
import { DateInput } from '@/components/ui/date-input';
import type { Booking, BookingStatus } from '@/types/booking';

const LIST_VIEW = 'list';
const CALENDAR_VIEW = 'calendar';
type ViewMode = typeof LIST_VIEW | typeof CALENDAR_VIEW;

const ALL_EMPLOYEES_VALUE = 'all';

const BOOKING_STATUS_VALUES = [
  ALL_STATUSES_VALUE,
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.NO_SHOW,
] as const;

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function BookingsPage() {
  const t = useTranslations('bookings');
  const tStatus = useTranslations('bookingStatus');
  const tCommon = useTranslations('common');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<ViewMode>(LIST_VIEW);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const dateFromUrl = searchParams.get('date') ?? undefined;
  const employeeIdFromUrl = searchParams.get('employeeId') ?? undefined;
  const statusFromUrl = (searchParams.get('status') as BookingStatus | null) ?? undefined;

  const { data: bookingsData, isLoading, isError, error } = useBookings({
    date: dateFromUrl,
    employeeId: employeeIdFromUrl,
    status: statusFromUrl,
  });

  const weekEnd = addDays(weekStart, WEEK_LENGTH - 1);
  const { data: calendarData } = useBookingCalendar({
    startDate: toDateString(weekStart),
    endDate: toDateString(weekEnd),
  });

  const { data: employeesData } = useEmployees();
  const { data: servicesData } = useServices({ isActive: true, limit: 100 });

  const employees = employeesData?.data ?? [];
  const services = servicesData?.data ?? [];

  const updateUrlParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const handleStatusChange = (value: string) => {
    const status = value === ALL_STATUSES_VALUE ? undefined : (value as BookingStatus);
    updateUrlParam('status', status);
  };

  const handleEmployeeChange = (value: string) => {
    const id = value === ALL_EMPLOYEES_VALUE ? undefined : value;
    updateUrlParam('employeeId', id);
  };

  const handleDateChange = (value: string) => {
    updateUrlParam('date', value || undefined);
  };

  const handleTodayClick = () => {
    updateUrlParam('date', toDateString(new Date()));
  };

  const hasActiveFilters = !!(dateFromUrl ?? employeeIdFromUrl ?? statusFromUrl);

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const handlePrevWeek = () => setWeekStart((prev) => addDays(prev, -WEEK_LENGTH));
  const handleNextWeek = () => setWeekStart((prev) => addDays(prev, WEEK_LENGTH));

  const bookings = bookingsData?.data ?? [];
  const totalBookings = bookingsData?.meta.total ?? 0;

  const employeeMap = new Map(employees.map((e) => [e.id, e.fullName]));
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-md border border-[hsl(var(--border))] p-1">
            <button
              type="button"
              onClick={() => setViewMode(LIST_VIEW)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === LIST_VIEW
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {t('listView')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode(CALENDAR_VIEW)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === CALENDAR_VIEW
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {t('calendarView')}
            </button>
          </div>

          <Button asChild>
            <Link href="/bookings/new">{t('newBooking')}</Link>
          </Button>
        </div>

        {viewMode === LIST_VIEW && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <DateInput
                value={dateFromUrl ?? ''}
                onChange={handleDateChange}
              />
              <Button variant="outline" size="sm" onClick={handleTodayClick}>
                {t('today')}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  {tCommon('actions.clearFilters')}
                </Button>
              )}
              <Select
                value={employeeIdFromUrl ?? ALL_EMPLOYEES_VALUE}
                onValueChange={handleEmployeeChange}
              >
                <SelectTrigger className="w-52">
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
              <Select
                value={statusFromUrl ?? ALL_STATUSES_VALUE}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={tStatus('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUS_VALUES.map((val) => (
                    <SelectItem key={val} value={val}>
                      {val === ALL_STATUSES_VALUE ? tStatus('allStatuses') : tStatus(val)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <BookingTable
              bookings={bookings}
              employees={employees}
              services={services}
              isLoading={isLoading}
              isError={isError}
              errorMessage={error instanceof Error ? error.message : undefined}
            />

            {bookingsData && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {totalBookings} booking{totalBookings !== 1 ? 's' : ''} total
              </p>
            )}
          </>
        )}

        {viewMode === CALENDAR_VIEW && (
          <>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                {t('previousWeek')}
              </Button>
              <span className="text-sm font-medium">
                {toDateString(weekStart)} – {toDateString(weekEnd)}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                {t('nextWeek')}
              </Button>
            </div>

            <BookingCalendar
              data={calendarData ?? {}}
              weekStart={weekStart}
              onBookingClick={setSelectedBooking}
            />
          </>
        )}
      </div>

      <Dialog open={selectedBooking !== null} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('detail.title')}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.status')}</span>
                <BookingStatusBadge status={selectedBooking.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.date')}</span>
                <span>{selectedBooking.bookingDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.time')}</span>
                <span>
                  {selectedBooking.startTime.slice(0, 5)} – {selectedBooking.endTime.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{t('detail.employeeId')}</span>
                <span>{employeeMap.get(selectedBooking.employeeId) ?? selectedBooking.employeeId}</span>
              </div>
              {selectedBooking.notes && (
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">{t('detail.notes')}</span>
                  <p className="mt-1">{selectedBooking.notes}</p>
                </div>
              )}
              <div className="pt-2">
                <Button asChild size="sm">
                  <Link href={`/bookings/${selectedBooking.id}`}>{t('detail.viewFull')}</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
