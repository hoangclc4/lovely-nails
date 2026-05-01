'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useBooking, useUpdateBookingStatus, useCancelBooking, useMarkNoShow } from '@/hooks/use-bookings';
import { useEmployee } from '@/hooks/use-employees';
import { useServices } from '@/hooks/use-services';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { Header } from '@/components/layout/header';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BOOKING_STATUS, BOOKINGS_PATH } from '@/constants/booking.constants';

export default function BookingDetailPage() {
  const t = useTranslations('bookings');

  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: booking, isLoading, isError, error } = useBooking(params.id);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus(params.id);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const { mutate: markNoShow, isPending: isMarkingNoShow } = useMarkNoShow(params.id);

  const { data: employeeData } = useEmployee(booking?.employeeId ?? '');
  const { data: servicesData } = useServices({ limit: 100 });

  const serviceMap = useMemo(
    () => new Map(servicesData?.data.map((s) => [s.id, s.name])),
    [servicesData],
  );

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);

  const handleCancel = () => {
    cancelBooking(params.id, {
      onSuccess: () => {
        router.push(BOOKINGS_PATH);
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <Header title={t('detail.title')} />
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isError || !booking) {
    return (
      <>
        <Header title={t('detail.title')} />
        <div className="p-6">
          <p className="text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : t('loadFailed')}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={BOOKINGS_PATH}>{t('detail.viewFull')}</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('detail.title')} />
      <div className="p-6 max-w-lg space-y-6">
        <Link
          href={BOOKINGS_PATH}
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          {t('detail.viewFull')}
        </Link>

        <div className="rounded-md border border-[hsl(var(--border))] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.status')}</span>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.date')}</span>
            <span className="text-sm">{booking.bookingDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.time')}</span>
            <span className="text-sm">
              {booking.startTime.slice(0, 5)} – {booking.endTime.slice(0, 5)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.employee')}</span>
            <span className="text-sm">{employeeData?.data.fullName ?? booking.employeeId}</span>
          </div>

          {booking.customerId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Customer ID</span>
              <span className="font-mono text-xs">{booking.customerId}</span>
            </div>
          )}

          <div>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.services')}</span>
            <div className="mt-1 space-y-1">
              {booking.serviceIds.map((id) => (
                <div key={id} className="text-sm text-[hsl(var(--foreground))]">
                  {serviceMap.get(id) ?? id}
                </div>
              ))}
            </div>
          </div>

          {booking.notes && (
            <div>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.notes')}</span>
              <p className="mt-1 text-sm">{booking.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>Created: {formatDateTime(booking.createdAt)}</span>
            <span>Updated: {formatDateTime(booking.updatedAt)}</span>
          </div>
        </div>

        {booking.status !== BOOKING_STATUS.COMPLETED &&
          booking.status !== BOOKING_STATUS.CANCELLED &&
          booking.status !== BOOKING_STATUS.NO_SHOW && (
            <div className="rounded-md border border-[hsl(var(--border))] p-5 space-y-3">
              <h2 className="text-sm font-semibold">{t('actions.title')}</h2>
              <div className="flex flex-wrap gap-2">
                {booking.status === BOOKING_STATUS.PENDING && (
                  <Button
                    onClick={() => updateStatus({ status: BOOKING_STATUS.CONFIRMED })}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? t('actions.processing') : t('actions.confirm')}
                  </Button>
                )}
                {booking.status === BOOKING_STATUS.CONFIRMED && (
                  <Button
                    onClick={() => updateStatus({ status: BOOKING_STATUS.IN_PROGRESS })}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? t('actions.processing') : t('actions.startService')}
                  </Button>
                )}
                {booking.status === BOOKING_STATUS.IN_PROGRESS && (
                  <Button
                    onClick={() => updateStatus({ status: BOOKING_STATUS.COMPLETED })}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? t('actions.processing') : t('actions.markComplete')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={isMarkingNoShow}
                  onClick={() => setNoShowDialogOpen(true)}
                >
                  {isMarkingNoShow ? t('noShow.marking') : t('noShow.markButton')}
                </Button>
              </div>

              <Dialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('noShow.dialogTitle')}</DialogTitle>
                    <DialogDescription>{t('noShow.dialogDescription')}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNoShowDialogOpen(false)}>
                      {t('noShow.cancel')}
                    </Button>
                    <Button
                      onClick={() => markNoShow(undefined, { onSuccess: () => setNoShowDialogOpen(false) })}
                      disabled={isMarkingNoShow}
                    >
                      {t('noShow.confirm')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}


        <div className="rounded-md border border-[hsl(var(--destructive)/0.3)] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[hsl(var(--destructive))]">Danger Zone</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cancelling a booking is a soft delete and cannot be undone easily.
          </p>
          <Button
            variant="destructive"
            size="sm"
            disabled={isCancelling}
            onClick={() => setCancelDialogOpen(true)}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>

          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel this booking?</DialogTitle>
                <DialogDescription>
                  This will cancel the booking. The record will be kept but marked as cancelled.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Go back
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                  Yes, cancel booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
