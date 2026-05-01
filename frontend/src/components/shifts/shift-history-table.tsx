'use client';

import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { WorkShift } from '@/types/shift';
import { useShifts } from '@/hooks/use-shifts';
import type { ShiftListParams } from '@/types/shift';

const SKELETON_ROW_COUNT = 5;
const COLUMN_COUNT = 6;

function formatTime(isoString: string | null): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const columnHelper = createColumnHelper<WorkShift>();

interface ShiftHistoryTableProps {
  params?: ShiftListParams;
}

export function ShiftHistoryTable({ params }: ShiftHistoryTableProps) {
  const t = useTranslations('timeTracking');
  const { data, isLoading, isError } = useShifts(params);
  const shifts = data?.data ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: t('columns.date'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('employeeId', {
        header: t('columns.employee'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('clockIn', {
        header: t('columns.clockIn'),
        cell: (info) => formatTime(info.getValue()),
      }),
      columnHelper.accessor('clockOut', {
        header: t('columns.clockOut'),
        cell: (info) => formatTime(info.getValue()),
      }),
      columnHelper.accessor('breakMinutes', {
        header: t('columns.breakMin'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('notes', {
        header: t('columns.notes'),
        cell: (info) => info.getValue() ?? '—',
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: shifts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <div className="rounded-md border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)] p-4 text-sm text-[hsl(var(--destructive))]">
        {t('loadFailed')}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-md border border-[hsl(var(--border))]">
      <table className="w-full caption-bottom text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[hsl(var(--border))]">
                {Array.from({ length: COLUMN_COUNT }).map((__, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-[hsl(var(--muted))]" />
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading && shifts.length === 0 && (
            <tr>
              <td
                colSpan={COLUMN_COUNT}
                className="py-12 text-center text-[hsl(var(--muted-foreground))]"
              >
                {t('noData')}
              </td>
            </tr>
          )}
          {!isLoading &&
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--muted)/0.5)]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
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
