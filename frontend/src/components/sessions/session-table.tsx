'use client';

import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SessionStatusBadge } from './session-status-badge';
import type { SessionSummary } from '@/types/session';
import type { Employee } from '@/types/employee';
import { SESSION_PATHS } from '@/constants/session.constants';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const columnHelper = createColumnHelper<SessionSummary>();

interface SessionTableProps {
  sessions: SessionSummary[];
  employees: Employee[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function SessionTable({ sessions, employees, isLoading, isError, errorMessage }: SessionTableProps) {
  const t = useTranslations('sessions');

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e.fullName])),
    [employees],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('sessionNumber', {
        header: t('columns.sessionNumber'),
        cell: (info) => (
          <span className="font-mono text-xs font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('employeeId', {
        header: t('columns.employee'),
        cell: (info) => employeeMap.get(info.getValue()) ?? info.getValue(),
      }),
      columnHelper.accessor('customerName', {
        header: t('columns.customer'),
        cell: (info) => {
          const val = info.getValue();
          return val ? (
            <span>{val}</span>
          ) : (
            <span className="text-[hsl(var(--muted-foreground))]">{t('columns.walkIn')}</span>
          );
        },
      }),
      columnHelper.accessor('startTime', {
        header: t('columns.started'),
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor('endTime', {
        header: t('columns.ended'),
        cell: (info) => {
          const val = info.getValue();
          return val ? formatDateTime(val) : '—';
        },
      }),
      columnHelper.accessor('totalAmount', {
        header: t('columns.total'),
        cell: (info) => {
          const val = parseFloat(info.getValue() ?? '0');
          return isNaN(val) ? '—' : formatCurrency(val);
        },
      }),
      columnHelper.accessor('status', {
        header: t('columns.status'),
        cell: (info) => <SessionStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('id', {
        header: '',
        id: 'actions',
        cell: (info) => (
          <Link
            href={SESSION_PATHS.DETAIL(info.getValue())}
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            {t('columns.view')}
          </Link>
        ),
      }),
    ],
    [t, employeeMap],
  );

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        {errorMessage ?? t('loadFailed')}
      </p>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('columns.noData')}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--muted))]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
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
