'use client';

import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useColumnSizing } from '@/hooks/use-column-sizing';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Employee } from '@/types/employee';
import { EmployeeStatusBadge } from './employee-status-badge';
import { Button } from '@/components/ui/button';

const columnHelper = createColumnHelper<Employee>();

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const t = useTranslations('employees');

  const [columnSizing, onColumnSizingChange] = useColumnSizing('lovely-nails:table:employees');

  const columns = useMemo(
    () => [
      columnHelper.accessor('fullName', {
        header: t('columns.fullName'),
        size: 200,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('phone', {
        header: t('columns.phone'),
        size: 150,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: t('columns.status'),
        size: 130,
        cell: (info) => <EmployeeStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('revenueSharePct', {
        header: t('columns.revenueShare'),
        size: 150,
        cell: (info) => `${info.getValue()}%`,
      }),
      columnHelper.accessor('id', {
        header: t('columns.actions'),
        size: 120,
        cell: (info) => (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/employees/${info.getValue()}`}>{t('columns.viewEdit')}</Link>
          </Button>
        ),
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: employees,
    columns,
    columnResizeMode: 'onChange',
    state: { columnSizing },
    onColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  if (employees.length === 0) {
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
