'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createServiceCategorySchema } from '@/schemas/service.schema';
import type { CreateServiceCategoryDto } from '@/schemas/service.schema';
import type { ServiceCategory } from '@/types/service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ServiceCategory | null;
  onSubmit: (data: CreateServiceCategoryDto) => void;
  isSubmitting: boolean;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isSubmitting,
}: CategoryDialogProps) {
  const t = useTranslations('services.categories.dialog');
  const tCommon = useTranslations('common');

  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceCategoryDto>({
    resolver: zodResolver(createServiceCategorySchema),
    defaultValues: { name: '', description: '', sortOrder: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              description: category.description ?? '',
              sortOrder: category.sortOrder,
              isActive: category.isActive,
            }
          : { name: '', description: '', sortOrder: 0, isActive: true },
      );
    }
  }, [open, category, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cat-name">{t('nameLabel')}</Label>
            <Input
              id="cat-name"
              {...register('name')}
              placeholder={t('namePlaceholder')}
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="cat-description">{t('descriptionLabel')}</Label>
            <textarea
              id="cat-description"
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              className="flex min-h-18 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cat-sortOrder">{t('sortOrderLabel')}</Label>
            <Input
              id="cat-sortOrder"
              type="number"
              min={0}
              {...register('sortOrder', { valueAsNumber: true })}
              placeholder={t('sortOrderPlaceholder')}
            />
            {errors.sortOrder && (
              <p className="text-sm text-[hsl(var(--destructive))]">{errors.sortOrder.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tCommon('saving') : tCommon('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
