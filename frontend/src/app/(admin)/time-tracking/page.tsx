'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmployeeStatusBoard } from '@/components/shifts/employee-status-board';
import { ShiftHistoryTable } from '@/components/shifts/shift-history-table';

export default function TimeTrackingPage() {
  const t = useTranslations('timeTracking');
  const tCommon = useTranslations('common');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const hasActiveFilters = dateFrom !== '' || dateTo !== '';

  const shiftParams = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  return (
    <>
      <Header title={t('title')} />
      <div className="space-y-8 p-6">
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t('employeeStatus')}</h2>
          <EmployeeStatusBoard />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{t('shiftHistory')}</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="date-from" className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('from')}
              </label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <label htmlFor="date-to" className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('to')}
              </label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  {tCommon('actions.clearFilters')}
                </Button>
              )}
            </div>
          </div>
          <ShiftHistoryTable params={shiftParams} />
        </section>
      </div>
    </>
  );
}
