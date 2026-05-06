'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCustomer, useCustomerHistory, useUpdateCustomer } from '@/hooks/use-customers';
import { useCustomerPhotos } from '@/hooks/use-session-photos';
import { updateCustomerSchema, type UpdateCustomerInput } from '@/schemas/customer.schema';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';

const CUSTOMERS_PATH = '/customers';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const tPhotos = useTranslations('sessionPhotos');
  const [isEditing, setIsEditing] = useState(false);

  const { data: customerData, isLoading: isLoadingCustomer, isError: isCustomerError, error: customerError } = useCustomer(id);
  const { data: historyData, isLoading: isLoadingHistory } = useCustomerHistory(id);
  const { data: photosData, isLoading: isLoadingPhotos } = useCustomerPhotos(id);
  const updateCustomer = useUpdateCustomer(id);

  const customer = customerData?.data;
  const history = historyData?.data;

  const form = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
  });

  const handleStartEdit = () => {
    if (!customer) return;
    form.reset({
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email ?? '',
      dateOfBirth: customer.dateOfBirth ?? '',
      notes: customer.notes ?? '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleSubmit = (data: UpdateCustomerInput) => {
    const payload: UpdateCustomerInput = {
      ...data,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      notes: data.notes || undefined,
    };

    updateCustomer.mutate(payload, {
      onSuccess: () => setIsEditing(false),
    });
  };

  if (isLoadingCustomer) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-6 animate-pulse rounded bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6">
          <p className="text-[hsl(var(--destructive))]">
            {customerError instanceof Error ? customerError.message : t('loadFailed')}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={customer.fullName} />
      <div className="p-6 space-y-6 max-w-2xl">
        <div className="mb-2">
          <Link
            href={CUSTOMERS_PATH}
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {t('backToCustomers')}
          </Link>
        </div>

        {/* Customer Info */}
        <div className="rounded-lg border border-[hsl(var(--border))] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{t('detail.customerInfo')}</h2>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                {tCommon('actions.edit')}
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('form.fullNameLabel')}</label>
                <Input {...form.register('fullName')} />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-[hsl(var(--destructive))]">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t('form.phoneLabel')}</label>
                <Input {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-xs text-[hsl(var(--destructive))]">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t('form.emailLabel')}</label>
                <Input type="email" {...form.register('email')} />
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
                  className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>

              {updateCustomer.isError && (
                <p className="text-sm text-[hsl(var(--destructive))]">
                  {updateCustomer.error instanceof Error
                    ? updateCustomer.error.message
                    : t('loadFailed')}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={updateCustomer.isPending}>
                  {updateCustomer.isPending ? t('form.saving') : tCommon('actions.save')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  {tCommon('actions.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.phone')}</dt>
              <dd>{customer.phone}</dd>

              <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.email')}</dt>
              <dd>{customer.email ?? '—'}</dd>

              <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.dateOfBirth')}</dt>
              <dd>
                {customer.dateOfBirth
                  ? new Date(customer.dateOfBirth).toLocaleDateString()
                  : '—'}
              </dd>

              <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.totalVisits')}</dt>
              <dd>{customer.totalVisits}</dd>

              <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.totalSpent')}</dt>
              <dd>{customer.totalSpent}</dd>

              <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.lastVisit')}</dt>
              <dd>
                {customer.lastVisitDate
                  ? new Date(customer.lastVisitDate).toLocaleDateString()
                  : '—'}
              </dd>

              {customer.notes && (
                <>
                  <dt className="text-[hsl(var(--muted-foreground))]">{t('detail.notes')}</dt>
                  <dd className="col-span-1">{customer.notes}</dd>
                </>
              )}
            </dl>
          )}
        </div>

        {/* Visit History */}
        <div className="rounded-lg border border-[hsl(var(--border))] p-5 space-y-4">
          <h2 className="text-base font-semibold">{t('visitHistory')}</h2>

          {isLoadingHistory ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded bg-[hsl(var(--muted))]" />
              ))}
            </div>
          ) : !history?.sessions || history.sessions.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noHistory')}</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    <th className="px-4 py-3 text-left font-medium">{t('history.date')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('history.startTime')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('history.endTime')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('history.amount')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('history.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.sessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="border-b border-[hsl(var(--border))] last:border-0"
                    >
                      <td className="px-4 py-3">
                        {session.startTime
                          ? new Date(session.startTime).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {session.startTime
                          ? new Date(session.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {session.endTime
                          ? new Date(session.endTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">{session.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[hsl(var(--muted))]">
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="rounded-lg border border-[hsl(var(--border))] p-5 space-y-4">
          <h2 className="text-base font-semibold">{tPhotos('customerGallery')}</h2>

          {isLoadingPhotos ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-md bg-[hsl(var(--muted))]" />
              ))}
            </div>
          ) : !photosData?.data || photosData.data.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{tPhotos('noPhotos')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photosData.data.map((photo) => (
                <div key={photo.id} className="space-y-1">
                  <img
                    src={photo.thumbnailUrl ?? photo.photoUrl}
                    alt={photo.caption ?? ''}
                    className="w-full aspect-square object-cover rounded-md border border-[hsl(var(--border))]"
                  />
                  {photo.caption && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
