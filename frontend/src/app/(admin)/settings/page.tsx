'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { updateSettingsSchema, type UpdateSettingsInput } from '@/schemas/settings.schema';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { data, isLoading, isError, error } = useSettings();
  const updateSettings = useUpdateSettings();
  const [successMessage, setSuccessMessage] = useState('');

  const settings = data?.data;

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
  });

  const tipPoolingEnabled = form.watch('tipPoolingEnabled');

  useEffect(() => {
    if (!settings) return;
    form.reset({
      salonName: settings.salonName,
      salonAddress: settings.salonAddress ?? '',
      salonPhone: settings.salonPhone ?? '',
      currency: settings.currency,
      timezone: settings.timezone,
      tipPoolingEnabled: settings.tipPoolingEnabled,
      tipPoolPercentage: settings.tipPoolPercentage,
      defaultBookingBuffer: settings.defaultBookingBuffer,
      autoLogoutMinutes: settings.autoLogoutMinutes,
      receiptFooterText: settings.receiptFooterText ?? '',
    });
  }, [settings, form]);

  const handleSubmit = (data: UpdateSettingsInput) => {
    setSuccessMessage('');
    updateSettings.mutate(data, {
      onSuccess: () => setSuccessMessage(t('saved')),
    });
  };

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-3 max-w-2xl">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6">
          <p className="text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : t('loadFailed')}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 max-w-2xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Business Info */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b border-[hsl(var(--border))] pb-2">
              {t('sections.businessInfo')}
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.salonName')}</label>
              <Input {...form.register('salonName')} />
              {form.formState.errors.salonName && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.salonName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.address')}</label>
              <Input {...form.register('salonAddress')} placeholder={t('fields.addressPlaceholder')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.phone')}</label>
              <Input {...form.register('salonPhone')} placeholder={t('fields.phonePlaceholder')} />
            </div>
          </section>

          {/* Regional */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b border-[hsl(var(--border))] pb-2">
              {t('sections.regional')}
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.currency')}</label>
              <Input {...form.register('currency')} placeholder="e.g. USD" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.timezone')}</label>
              <Input {...form.register('timezone')} placeholder="e.g. Pacific/Guam" />
            </div>
          </section>

          {/* Tips */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b border-[hsl(var(--border))] pb-2">
              {t('sections.tips')}
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tipPoolingEnabled"
                className="h-4 w-4 rounded border-[hsl(var(--border))]"
                {...form.register('tipPoolingEnabled')}
              />
              <label htmlFor="tipPoolingEnabled" className="text-sm font-medium">
                {t('tipPoolingEnabled')}
              </label>
            </div>
            {tipPoolingEnabled && (
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('fields.defaultTipPct')}</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  {...form.register('tipPoolPercentage', { valueAsNumber: true })}
                />
                {form.formState.errors.tipPoolPercentage && (
                  <p className="text-xs text-[hsl(var(--destructive))]">
                    {form.formState.errors.tipPoolPercentage.message}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Booking */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b border-[hsl(var(--border))] pb-2">
              {t('sections.booking')}
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.bookingLeadHours')}</label>
              <Input
                type="number"
                min={0}
                step={1}
                {...form.register('defaultBookingBuffer', { valueAsNumber: true })}
              />
              {form.formState.errors.defaultBookingBuffer && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.defaultBookingBuffer.message}
                </p>
              )}
            </div>
          </section>

          {/* Security */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b border-[hsl(var(--border))] pb-2">
              {t('sections.security')}
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.autoLogout')}</label>
              <Input
                type="number"
                min={1}
                step={1}
                {...form.register('autoLogoutMinutes', { valueAsNumber: true })}
              />
              {form.formState.errors.autoLogoutMinutes && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.autoLogoutMinutes.message}
                </p>
              )}
            </div>
          </section>

          {/* Receipt */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b border-[hsl(var(--border))] pb-2">
              {t('sections.receipt')}
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.footerText')}</label>
              <textarea
                {...form.register('receiptFooterText')}
                rows={3}
                placeholder={t('fields.footerPlaceholder')}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </section>

          {updateSettings.isError && (
            <p className="text-sm text-[hsl(var(--destructive))]">
              {updateSettings.error instanceof Error
                ? updateSettings.error.message
                : t('saveFailed')}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? t('saving') : t('saveSettings')}
          </Button>
        </form>
      </div>
    </>
  );
}
