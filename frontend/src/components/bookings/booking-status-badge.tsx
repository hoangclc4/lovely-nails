'use client';

import { useTranslations } from 'next-intl';
import { BOOKING_STATUS } from '@/constants/booking.constants';
import type { BookingStatus } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<BookingStatus, string> = {
  [BOOKING_STATUS.PENDING]: 'border-transparent bg-yellow-500 text-white',
  [BOOKING_STATUS.CONFIRMED]: 'border-transparent bg-blue-500 text-white',
  [BOOKING_STATUS.IN_PROGRESS]: 'border-transparent bg-orange-500 text-white',
  [BOOKING_STATUS.COMPLETED]: 'border-transparent bg-green-600 text-white',
  [BOOKING_STATUS.CANCELLED]: 'border-transparent bg-gray-400 text-white',
  [BOOKING_STATUS.NO_SHOW]: 'border-transparent bg-red-600 text-white',
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const t = useTranslations('bookingStatus');
  return (
    <Badge className={cn(STATUS_CLASS[status])}>
      {t(status)}
    </Badge>
  );
}
