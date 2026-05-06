'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateCustomer } from '@/hooks/use-customers';
import { createCustomerSchema, type CreateCustomerInput } from '@/schemas/customer.schema';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';

const CUSTOMERS_PATH = '/customers';

export default function NewCustomerPage() {
  const router = useRouter();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const createCustomer = useCreateCustomer();

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      notes: '',
    },
  });

  const handleSubmit = (data: CreateCustomerInput) => {
    const payload: CreateCustomerInput = {
      ...data,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      notes: data.notes || undefined,
    };

    createCustomer.mutate(payload, {
      onSuccess: () => router.push(CUSTOMERS_PATH),
    });
  };

  return (
    <>
      <Header title={t('addCustomer')} />
      <div className="p-6 max-w-lg">
        <div className="mb-4">
          <Link
            href={CUSTOMERS_PATH}
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {t('backToCustomers')}
          </Link>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.fullNameLabel')}</label>
            <Input {...form.register('fullName')} placeholder={t('form.fullNamePlaceholder')} />
            {form.formState.errors.fullName && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.phoneLabel')}</label>
            <Input {...form.register('phone')} placeholder={t('form.phonePlaceholder')} />
            {form.formState.errors.phone && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.emailLabel')}</label>
            <Input type="email" {...form.register('email')} placeholder={t('form.emailPlaceholder')} />
            {form.formState.errors.email && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.dateOfBirthLabel')}</label>
            <Controller
              name="dateOfBirth"
              control={form.control}
              render={({ field }) => (
                <DateInput
                  id="dateOfBirth"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('form.notesLabel')}</label>
            <textarea
              {...form.register('notes')}
              rows={3}
              placeholder={t('form.notesPlaceholder')}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          {createCustomer.isError && (
            <p className="text-sm text-[hsl(var(--destructive))]">
              {createCustomer.error instanceof Error
                ? createCustomer.error.message
                : t('loadFailed')}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? t('form.saving') : t('form.submit')}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={CUSTOMERS_PATH}>{tCommon('actions.cancel')}</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
