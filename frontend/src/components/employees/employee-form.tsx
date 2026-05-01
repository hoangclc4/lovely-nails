'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createEmployeeSchema } from '@/schemas/employee.schema';
import type { CreateEmployeeDto } from '@/schemas/employee.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const REVENUE_SHARE_STEP = 1;

interface EmployeeFormProps {
  defaultValues?: Partial<CreateEmployeeDto>;
  onSubmit: (data: CreateEmployeeDto) => void;
  isLoading?: boolean;
}

export function EmployeeForm({ defaultValues, onSubmit, isLoading }: EmployeeFormProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmployeeDto>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="fullName">{t('form.fullNameLabel')}</Label>
        <Input id="fullName" {...register('fullName')} placeholder={t('form.fullNamePlaceholder')} />
        {errors.fullName && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">{t('form.phoneLabel')}</Label>
        <Input id="phone" {...register('phone')} placeholder={t('form.phonePlaceholder')} />
        {errors.phone && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">{t('form.emailLabel')}</Label>
        <Input id="email" type="email" {...register('email')} placeholder={t('form.emailPlaceholder')} />
        {errors.email && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="revenueSharePct">{t('form.revenueShareLabel')}</Label>
        <Input
          id="revenueSharePct"
          type="number"
          step={REVENUE_SHARE_STEP}
          min={0}
          max={100}
          {...register('revenueSharePct', { valueAsNumber: true })}
          placeholder={t('form.revenueSharePlaceholder')}
        />
        {errors.revenueSharePct && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.revenueSharePct.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? tCommon('saving') : t('form.submit')}
      </Button>
    </form>
  );
}
