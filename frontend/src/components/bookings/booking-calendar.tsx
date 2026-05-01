'use client';

import type { Booking, CalendarData } from '@/types/booking';
import { BOOKING_STATUS, WEEK_LENGTH } from '@/constants/booking.constants';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_CARD_CLASS: Record<string, string> = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 border-yellow-400 text-yellow-900',
  [BOOKING_STATUS.CONFIRMED]: 'bg-blue-100 border-blue-400 text-blue-900',
  [BOOKING_STATUS.IN_PROGRESS]: 'bg-orange-100 border-orange-400 text-orange-900',
  [BOOKING_STATUS.COMPLETED]: 'bg-green-100 border-green-400 text-green-900',
  [BOOKING_STATUS.CANCELLED]: 'bg-gray-100 border-gray-400 text-gray-600',
  [BOOKING_STATUS.NO_SHOW]: 'bg-red-100 border-red-400 text-red-900',
};

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: WEEK_LENGTH }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDayHeader(date: Date, label: string): string {
  return `${label} ${date.getDate()}/${date.getMonth() + 1}`;
}

interface BookingCardProps {
  booking: Booking;
  onClick: (booking: Booking) => void;
}

function BookingCard({ booking, onClick }: BookingCardProps) {
  const cardClass = STATUS_CARD_CLASS[booking.status] ?? 'bg-gray-100 border-gray-400 text-gray-900';

  return (
    <button
      type="button"
      onClick={() => onClick(booking)}
      className={cn(
        'w-full rounded border-l-4 px-2 py-1 text-left text-xs transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
        cardClass,
      )}
    >
      <div className="font-medium">
        {booking.startTime.slice(0, 5)} – {booking.endTime.slice(0, 5)}
      </div>
      <div className="truncate opacity-75">
        {booking.employeeName}
      </div>
    </button>
  );
}

interface BookingCalendarProps {
  data: CalendarData;
  weekStart: Date;
  onBookingClick: (booking: Booking) => void;
}

export function BookingCalendar({ data, weekStart, onBookingClick }: BookingCalendarProps) {
  const weekDates = getWeekDates(weekStart);

  return (
    <div
      className="grid gap-px bg-[hsl(var(--border))] rounded-md overflow-hidden border border-[hsl(var(--border))]"
      style={{ gridTemplateColumns: `repeat(${WEEK_LENGTH}, minmax(0, 1fr))` }}
    >
      {weekDates.map((date, index) => {
        const dateStr = toDateString(date);
        const dayBookings = (data[dateStr] ?? []).slice().sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        );
        const isToday = toDateString(new Date()) === dateStr;
        const dayLabel = DAY_LABELS[index] ?? 'Day';

        return (
          <div key={dateStr} className="flex flex-col bg-[hsl(var(--card))]">
            <div
              className={cn(
                'sticky top-0 px-2 py-2 text-center text-xs font-semibold border-b border-[hsl(var(--border))]',
                isToday
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]',
              )}
            >
              {formatDayHeader(date, dayLabel)}
            </div>
            <div className="flex flex-col gap-1 p-1 min-h-32">
              {dayBookings.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
                  —
                </div>
              ) : (
                dayBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onClick={onBookingClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
