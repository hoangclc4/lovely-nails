'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createServiceSchema } from '@/schemas/service.schema';
import type { CreateServiceDto } from '@/schemas/service.schema';
import type { ServiceCategory } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DURATION_MIN = 1;
const NO_CATEGORY_VALUE = 'none';

interface ServiceFormProps {
  onSubmit: (data: CreateServiceDto) => void;
  isLoading: boolean;
  categories: ServiceCategory[];
  defaultValues?: Partial<CreateServiceDto>;
}

export function ServiceForm({ onSubmit, isLoading, categories, defaultValues }: ServiceFormProps) {
  const t = useTranslations('services');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateServiceDto>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: defaultValues ?? {},
  });

  const categoryIdValue = watch('categoryId');

  const handleCategoryChange = (value: string) => {
    if (value === NO_CATEGORY_VALUE) {
      setValue('categoryId', undefined);
      return;
    }
    setValue('categoryId', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">{t('form.nameLabel')}</Label>
        <Input id="name" {...register('name')} placeholder={t('form.namePlaceholder')} />
        {errors.name && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
        <textarea
          id="description"
          {...register('description')}
          placeholder={t('form.descriptionPlaceholder')}
          className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.description && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="price">{t('form.priceLabel')}</Label>
        <Input
          id="price"
          type="number"
          min={0}
          step={0.01}
          {...register('price', { valueAsNumber: true })}
          placeholder={t('form.pricePlaceholder')}
        />
        {errors.price && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.price.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="durationMinutes">{t('form.durationLabel')}</Label>
        <Input
          id="durationMinutes"
          type="number"
          min={DURATION_MIN}
          {...register('durationMinutes', { valueAsNumber: true })}
          placeholder={t('form.durationPlaceholder')}
        />
        {errors.durationMinutes && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.durationMinutes.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="categoryId">{t('form.categoryLabel')}</Label>
        <Select
          value={categoryIdValue ?? NO_CATEGORY_VALUE}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger id="categoryId">
            <SelectValue placeholder={t('form.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CATEGORY_VALUE}>{t('form.noCategory')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.categoryId.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? t('form.saving') : t('form.save')}
      </Button>
    </form>
  );
}
