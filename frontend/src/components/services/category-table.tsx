'use client';

import { useTranslations } from 'next-intl';
import type { ServiceCategory } from '@/types/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CategoryTableProps {
  categories: ServiceCategory[];
  onEdit: (category: ServiceCategory) => void;
  onDelete: (category: ServiceCategory) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  const t = useTranslations('services.categories');
  const tCommon = useTranslations('common');

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
        {t('empty')}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-md border border-[hsl(var(--border))]">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
            {(['name', 'description', 'sortOrder', 'status', 'actions'] as const).map((col) => (
              <th
                key={col}
                className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]"
              >
                {t(`columns.${col}`)}
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
              <td className="px-4 py-3 align-middle font-medium">{category.name}</td>
              <td className="px-4 py-3 align-middle text-[hsl(var(--muted-foreground))] max-w-xs truncate">
                {category.description ?? '—'}
              </td>
              <td className="px-4 py-3 align-middle">{category.sortOrder}</td>
              <td className="px-4 py-3 align-middle">
                {category.isActive ? (
                  <Badge variant="success">{tCommon('status.active')}</Badge>
                ) : (
                  <Badge variant="secondary">{tCommon('status.inactive')}</Badge>
                )}
              </td>
              <td className="px-4 py-3 align-middle">
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
