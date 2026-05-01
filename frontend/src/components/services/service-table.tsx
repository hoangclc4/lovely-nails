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
import type { Service, ServiceCategory } from '@/types/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const columnHelper = createColumnHelper<Service>();

const CATEGORY_BADGE_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
] as const;

interface ServiceTableProps {
  services: Service[];
  categories: ServiceCategory[];
  onDelete: (service: Service) => void;
}

export function ServiceTable({ services, categories, onDelete }: ServiceTableProps) {
  const t = useTranslations('services');

  const categoryMap = useMemo(
    () => new Map(categories.map((c, i) => [c.id, { name: c.name, colorClass: CATEGORY_BADGE_COLORS[i % CATEGORY_BADGE_COLORS.length] }])),
    [categories],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('columns.name'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('categoryId', {
        header: t('columns.category'),
        cell: (info) => {
          const id = info.getValue();
          if (!id) return '—';
          const category = categoryMap.get(id);
          if (!category) return '—';
          return (
            <Badge variant="outline" className={category.colorClass}>
              {category.name}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: t('columns.price'),
        cell: (info) => formatCurrency(parseFloat(String(info.getValue()))),
      }),
      columnHelper.accessor('durationMinutes', {
        header: t('columns.duration'),
        cell: (info) => `${info.getValue()} min`,
      }),
      columnHelper.accessor('isActive', {
        header: t('columns.status'),
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="success">{t('columns.active')}</Badge>
          ) : (
            <Badge variant="secondary">{t('columns.inactive')}</Badge>
          ),
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/services/${info.row.original.id}`}>{t('columns.edit')}</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)]"
              onClick={() => onDelete(info.row.original)}
            >
              {t('columns.delete')}
            </Button>
          </div>
        ),
      }),
    ],
    [categoryMap, onDelete, t],
  );

  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
        {t('columns.noData')}
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
          {table.getRowModel().rows.map((row) => (
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
