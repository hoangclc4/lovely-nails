'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useColumnSizing } from '@/hooks/use-column-sizing';
import Link from 'next/link';
import type { Booking, BookingStatus } from '@/types/booking';
import type { Employee } from '@/types/employee';
import type { Service } from '@/types/service';
import { useUpdateBookingStatus } from '@/hooks/use-bookings';
import { useCreateSession } from '@/hooks/use-sessions';
import { BOOKING_STATUS } from '@/constants/booking.constants';
import { SESSION_PATHS } from '@/constants/session.constants';
import { BookingStatusBadge } from './booking-status-badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const columnHelper = createColumnHelper<Booking>();

const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  [BOOKING_STATUS.PENDING]: BOOKING_STATUS.CONFIRMED,
  [BOOKING_STATUS.CONFIRMED]: BOOKING_STATUS.IN_PROGRESS,
  [BOOKING_STATUS.IN_PROGRESS]: BOOKING_STATUS.COMPLETED,
};

interface BookingTableRowActionsProps {
  booking: Booking;
}

function BookingTableRowActions({ booking }: BookingTableRowActionsProps) {
  const t = useTranslations('bookings');
  const router = useRouter();
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus(booking.id);
  const { mutateAsync: createSession, isPending: isCreatingSession } = useCreateSession();

  const ACTION_LABEL: Partial<Record<BookingStatus, string>> = {
    [BOOKING_STATUS.PENDING]: t('actions.confirm'),
    [BOOKING_STATUS.CONFIRMED]: t('actions.startService'),
    [BOOKING_STATUS.IN_PROGRESS]: t('actions.markComplete'),
  };

  const nextStatus = NEXT_STATUS[booking.status];
  const label = ACTION_LABEL[booking.status];

  if (!nextStatus || !label) return null;

  const isPending = isUpdatingStatus || isCreatingSession;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateStatus({ status: nextStatus });
    if (nextStatus === BOOKING_STATUS.CONFIRMED) {
      const result = await createSession({
        bookingId: booking.id,
        employeeId: booking.employeeId,
        serviceIds: booking.serviceIds,
        customerId: booking.customerId ?? undefined,
        notes: booking.notes ?? undefined,
        startTime: `${booking.bookingDate}T${booking.startTime}Z`,
      });
      router.push(SESSION_PATHS.DETAIL(result.id));
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={(e) => {
        void handleClick(e);
      }}
    >
      {isPending ? t('actions.processing') : label}
    </Button>
  );
}

interface BookingTableProps {
  bookings: Booking[];
  employees: Employee[];
  services: Service[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const SKELETON_ROWS = 5;

export function BookingTable({
  bookings,
  employees,
  services,
  isLoading,
  isError,
  errorMessage,
}: BookingTableProps) {
  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e.fullName])),
    [employees],
  );

  const serviceMap = useMemo(
    () => new Map(services.map((s) => [s.id, s.name])),
    [services],
  );

  const servicePriceMap = useMemo(
    () => new Map(services.map((s) => [s.id, parseFloat(s.price)])),
    [services],
  );

  const t = useTranslations('bookings');

  const [columnSizing, onColumnSizingChange] = useColumnSizing('lovely-nails:table:bookings');

  const columns = useMemo(
    () => [
      columnHelper.accessor('bookingNumber', {
        header: t('columns.bookingNumber'),
        size: 130,
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('customerName', {
        header: t('columns.customer'),
        size: 140,
        cell: (info) => {
          const name = info.getValue();
          return name ? (
            <span>{name}</span>
          ) : (
            <span className="text-[hsl(var(--muted-foreground))]">{t('columns.guest')}</span>
          );
        },
      }),
      columnHelper.accessor('bookingDate', {
        header: t('columns.date'),
        size: 110,
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: 'time',
        header: t('columns.time'),
        size: 110,
        cell: (info) => {
          const { startTime, endTime } = info.row.original;
          return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
        },
      }),
      columnHelper.accessor('employeeId', {
        header: t('columns.employee'),
        size: 140,
        cell: (info) => employeeMap.get(info.getValue()) ?? info.getValue(),
      }),
      columnHelper.accessor('serviceIds', {
        header: t('columns.services'),
        size: 180,
        cell: (info) => {
          const ids = info.getValue();
          if (ids.length === 0) return '—';
          const names = ids.map((id) => serviceMap.get(id) ?? id);
          return (
            <span className="max-w-50 truncate block" title={names.join(', ')}>
              {names.join(', ')}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'total',
        header: t('columns.total'),
        size: 100,
        cell: (info) => {
          const ids = info.row.original.serviceIds;
          const total = ids.reduce((sum, id) => sum + (servicePriceMap.get(id) ?? 0), 0);
          return total > 0 ? formatCurrency(total) : '—';
        },
      }),
      columnHelper.display({
        id: 'session',
        header: t('columns.session'),
        size: 110,
        cell: (info) => {
          const sessionId = info.row.original.sessionId;
          if (!sessionId) return <span className="text-[hsl(var(--muted-foreground))]">—</span>;
          return (
            <Link
              href={SESSION_PATHS.DETAIL(sessionId)}
              className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
            >
              {t('columns.viewSession')}
            </Link>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: t('columns.status'),
        size: 130,
        cell: (info) => <BookingStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('notes', {
        header: t('columns.notes'),
        size: 150,
        cell: (info) => {
          const notes = info.getValue();
          return notes ? (
            <span className="max-w-xs truncate block">{notes}</span>
          ) : (
            <span className="text-[hsl(var(--muted-foreground))]">—</span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 170,
        cell: (info) => (
          <div className="flex items-center gap-1">
            <BookingTableRowActions booking={info.row.original} />
            <Button asChild variant="ghost" size="sm">
              <Link href={`/bookings/${info.row.original.id}`}>{t('columns.view')}</Link>
            </Button>
          </div>
        ),
      }),
    ],
    [employeeMap, serviceMap, t],
  );

  const table = useReactTable({
    data: bookings,
    columns,
    columnResizeMode: 'onChange',
    state: { columnSizing },
    onColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-[hsl(var(--destructive))]">
        {errorMessage ?? t('columns.noData')}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
        {t('columns.noData')}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-md border border-[hsl(var(--border))]">
      <table className="caption-bottom text-sm" style={{ width: table.getTotalSize() }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="group relative h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`absolute inset-y-0 right-0 w-1 cursor-col-resize select-none touch-none transition-colors ${
                      header.column.getIsResizing()
                        ? 'bg-[hsl(var(--primary))]'
                        : 'bg-[hsl(var(--border))] opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--muted)/0.5)]"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 py-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
