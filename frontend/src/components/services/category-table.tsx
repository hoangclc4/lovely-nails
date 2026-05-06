'use client';

import { useTranslations } from 'next-intl';
import type { ServiceCategory } from '@/types/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useColumnSizing } from '@/hooks/use-column-sizing';

const CATEGORY_COL_IDS = ['name', 'description', 'sortOrder', 'status', 'actions'] as const;
type CategoryColId = (typeof CATEGORY_COL_IDS)[number];

const DEFAULT_SIZES: Record<CategoryColId, number> = {
  name: 200,
  description: 250,
  sortOrder: 100,
  status: 120,
  actions: 150,
};

interface CategoryTableProps {
  categories: ServiceCategory[];
  onEdit: (category: ServiceCategory) => void;
  onDelete: (category: ServiceCategory) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  const t = useTranslations('services.categories');
  const tCommon = useTranslations('common');

  const [columnSizing, onColumnSizingChange] = useColumnSizing('lovely-nails:table:categories');

  const getSize = (col: CategoryColId) => columnSizing[col] ?? DEFAULT_SIZES[col];

  const totalSize = CATEGORY_COL_IDS.reduce((sum, col) => sum + getSize(col), 0);

  const startResize = (col: CategoryColId) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startSize = getSize(col);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const next = Math.max(50, startSize + moveEvent.clientX - startX);
      onColumnSizingChange((prev) => ({ ...prev, [col]: next }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
        {t('empty')}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-md border border-[hsl(var(--border))]">
      <table className="caption-bottom text-sm" style={{ width: totalSize }}>
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
            {CATEGORY_COL_IDS.map((col) => (
              <th
                key={col}
                style={{ width: getSize(col) }}
                className="group relative h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]"
              >
                {t(`columns.${col}`)}
                <div
                  onMouseDown={startResize(col)}
                  className="absolute inset-y-0 right-0 w-1 cursor-col-resize select-none touch-none bg-[hsl(var(--border))] opacity-0 transition-colors group-hover:opacity-100"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b border-[hsl(var(--border))] last:border-0 transition-colors hover:bg-[hsl(var(--muted)/0.5)]"
            >
              <td style={{ width: getSize('name') }} className="px-4 py-3 align-middle font-medium">{category.name}</td>
              <td style={{ width: getSize('description') }} className="px-4 py-3 align-middle text-[hsl(var(--muted-foreground))] truncate max-w-xs">
                {category.description ?? '—'}
              </td>
              <td style={{ width: getSize('sortOrder') }} className="px-4 py-3 align-middle">{category.sortOrder}</td>
              <td style={{ width: getSize('status') }} className="px-4 py-3 align-middle">
                {category.isActive ? (
                  <Badge variant="success">{tCommon('status.active')}</Badge>
                ) : (
                  <Badge variant="secondary">{tCommon('status.inactive')}</Badge>
                )}
              </td>
              <td style={{ width: getSize('actions') }} className="px-4 py-3 align-middle">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
                    {tCommon('actions.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)]"
                    onClick={() => onDelete(category)}
                  >
                    {tCommon('actions.delete')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
