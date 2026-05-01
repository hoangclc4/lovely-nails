'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRevenueReport, useEmployeeReport, useServiceReport, useFinancialReport } from '@/hooks/use-reports';
import { useIncidentReport, useIncidents, useUpdateIncident } from '@/hooks/use-incidents';
import type { BookingIncident } from '@/types/incident';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { RevenueDataPoint, EmployeeReportEntry, ServiceReportEntry, FinancialEmployeeEntry } from '@/types/report';

const TABS = ['Revenue', 'Employees', 'Services', 'Financial', 'NoShows'] as const;
type Tab = (typeof TABS)[number];

const TAB_REVENUE: Tab = 'Revenue';
const TAB_EMPLOYEES: Tab = 'Employees';
const TAB_SERVICES: Tab = 'Services';
const TAB_FINANCIAL: Tab = 'Financial';
const TAB_NO_SHOWS: Tab = 'NoShows';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toIsoDate(d);
}

function defaultDateTo(): string {
  return toIsoDate(new Date());
}

const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
type MonthValue = (typeof MONTH_VALUES)[number];

function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}) {
  const t = useTranslations('reports');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="space-y-1">
        <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('dateRange.from')}</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('dateRange.to')}</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>
    </div>
  );
}

function RevenueTab() {
  const t = useTranslations('reports');
  const [dateFrom, setDateFrom] = useState(defaultDateFrom());
  const [dateTo, setDateTo] = useState(defaultDateTo());

  const { data: revenueResponse, isLoading, isError } = useRevenueReport({ dateFrom, dateTo });
  const data = revenueResponse?.data;

  return (
    <div className="space-y-6">
      <DateRangePicker
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-red-500">{t('loadFailed')}</p>}

      {!isLoading && !isError && !data && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noData')}</p>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('totalRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(data.totalRevenue))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('totalTips')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(data.totalTips))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('totalSessions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data.totalSessions}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('revenueByDay')}</h3>
            {(data.dataPoints ?? []).length === 0 && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noDataPoints')}</p>
            )}
            {(data.dataPoints ?? []).length > 0 && (
              <div className="rounded-md border border-[hsl(var(--border))]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                      <th className="px-4 py-3 text-left font-medium">{t('columns.date')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('columns.revenue')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('columns.tips')}</th>
                      <th className="px-4 py-3 text-left font-medium">{t('columns.sessions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {(data.dataPoints ?? []).map((point: RevenueDataPoint) => (
                      <tr key={point.date} className="hover:bg-[hsl(var(--accent)/0.5)]">
                        <td className="px-4 py-3">{point.date}</td>
                        <td className="px-4 py-3">{formatCurrency(parseFloat(point.revenue))}</td>
                        <td className="px-4 py-3">{formatCurrency(parseFloat(point.tips))}</td>
                        <td className="px-4 py-3">{point.sessionsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmployeesTab() {
  const t = useTranslations('reports');
  const [dateFrom, setDateFrom] = useState(defaultDateFrom());
  const [dateTo, setDateTo] = useState(defaultDateTo());

  const { data: employeeResponse, isLoading, isError } = useEmployeeReport({ dateFrom, dateTo });

  const entries = employeeResponse?.data?.employees ?? [];

  return (
    <div className="space-y-6">
      <DateRangePicker
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-red-500">{t('loadFailed')}</p>}

      {!isLoading && !isError && entries.length === 0 && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noDataPeriod')}</p>
      )}

      {!isLoading && !isError && entries.length > 0 && (
        <div className="rounded-md border border-[hsl(var(--border))]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                <th className="px-4 py-3 text-left font-medium">{t('columns.employee')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.sessions')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.revenue')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.tips')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.avgSession')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {entries.map((entry: EmployeeReportEntry) => (
                <tr key={entry.employeeId} className="hover:bg-[hsl(var(--accent)/0.5)]">
                  <td className="px-4 py-3 font-medium">{entry.fullName}</td>
                  <td className="px-4 py-3">{entry.sessionsCount}</td>
                  <td className="px-4 py-3">{formatCurrency(parseFloat(entry.revenue))}</td>
                  <td className="px-4 py-3">{formatCurrency(parseFloat(entry.tips))}</td>
                  <td className="px-4 py-3">{parseFloat(entry.avgSessionMinutes).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ServicesTab() {
  const t = useTranslations('reports');
  const [dateFrom, setDateFrom] = useState(defaultDateFrom());
  const [dateTo, setDateTo] = useState(defaultDateTo());

  const { data: serviceResponse, isLoading, isError } = useServiceReport({ dateFrom, dateTo });

  const entries = (serviceResponse?.data?.services ?? []).slice().sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="space-y-6">
      <DateRangePicker
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-red-500">{t('loadFailed')}</p>}

      {!isLoading && !isError && entries.length === 0 && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noDataPeriod')}</p>
      )}

      {!isLoading && !isError && entries.length > 0 && (
        <div className="rounded-md border border-[hsl(var(--border))]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                <th className="px-4 py-3 text-left font-medium">{t('columns.service')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.sessions')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.revenue')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.avgPrice')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {entries.map((entry: ServiceReportEntry) => (
                <tr key={entry.serviceId} className="hover:bg-[hsl(var(--accent)/0.5)]">
                  <td className="px-4 py-3 font-medium">{entry.name}</td>
                  <td className="px-4 py-3">{entry.usageCount}</td>
                  <td className="px-4 py-3">{formatCurrency(parseFloat(entry.totalRevenue))}</td>
                  <td className="px-4 py-3">{formatCurrency(parseFloat(entry.avgPrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FinancialTab() {
  const t = useTranslations('reports');
  const [month, setMonth] = useState<number>(CURRENT_MONTH);
  const [year, setYear] = useState<number>(CURRENT_YEAR);

  const { data: financialResponse, isLoading, isError } = useFinancialReport({ month, year });
  const data = financialResponse?.data;

  const breakdown = data?.employees ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('dateRange.month')}</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            {MONTH_VALUES.map((m) => (
              <option key={m} value={m}>
                {t(`months.${m}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('dateRange.year')}</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 w-24 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-red-500">{t('loadFailed')}</p>}

      {!isLoading && !isError && !data && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noData')}</p>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('totalRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(data.totalRevenue))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('totalPayroll')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(data.totalPayroll))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('totalTips')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(data.totalTips))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t('netProfit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(data.netProfit))}
                </p>
              </CardContent>
            </Card>
          </div>

          {breakdown.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noBreakdown')}</p>
          )}
          {breakdown.length > 0 && (
            <div className="rounded-md border border-[hsl(var(--border))]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                    <th className="px-4 py-3 text-left font-medium">{t('columns.employee')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('columns.revenue')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('columns.revenueShare')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('columns.profitMargin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {breakdown.map((entry: FinancialEmployeeEntry) => (
                    <tr key={entry.employeeId} className="hover:bg-[hsl(var(--accent)/0.5)]">
                      <td className="px-4 py-3 font-medium">{entry.fullName}</td>
                      <td className="px-4 py-3">{formatCurrency(parseFloat(entry.revenueGenerated))}</td>
                      <td className="px-4 py-3">{formatCurrency(parseFloat(entry.revenueShare))}</td>
                      <td className="px-4 py-3">{entry.profitMargin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoShowsTab() {
  const t = useTranslations('reports');
  const [month, setMonth] = useState<number>(CURRENT_MONTH);
  const [year, setYear] = useState<number>(CURRENT_YEAR);

  const { data: report, isLoading: isLoadingReport, isError: isErrorReport } = useIncidentReport(month, year);
  const { data: incidentsData, isLoading: isLoadingList } = useIncidents({ page: 1, limit: 50 });
  const { mutate: updateIncident } = useUpdateIncident();

  const incidents = incidentsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('dateRange.month')}</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            {MONTH_VALUES.map((m) => (
              <option key={m} value={m}>
                {t(`months.${m as MonthValue}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">{t('dateRange.year')}</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 w-24 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {isLoadingReport && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      )}

      {isErrorReport && <p className="text-sm text-red-500">{t('loadFailed')}</p>}

      {!isLoadingReport && !isErrorReport && report && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {t('noShows.totalNoShows')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{report.totalNoShows}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {t('noShows.totalLateCancels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{report.totalLateCancels}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {t('noShows.revenueLost')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(parseFloat(report.totalRevenueLost))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {t('noShows.topOffenders')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{report.topOffenders.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{t('noShows.incidentList')}</h3>
        {isLoadingList && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
            ))}
          </div>
        )}
        {!isLoadingList && incidents.length === 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noShows.noIncidents')}</p>
        )}
        {!isLoadingList && incidents.length > 0 && (
          <div className="rounded-md border border-[hsl(var(--border))]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <th className="px-4 py-3 text-left font-medium">{t('noShows.columns.date')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('noShows.columns.type')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('noShows.columns.revenueLost')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('noShows.columns.excused')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('noShows.columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {incidents.map((incident: BookingIncident) => (
                  <tr key={incident.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                    <td className="px-4 py-3">{incident.scheduledDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        incident.type === 'no_show'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {t(`noShows.type.${incident.type}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(parseFloat(incident.estimatedRevenueLost))}</td>
                    <td className="px-4 py-3">
                      {incident.excused ? (
                        <span className="text-[hsl(var(--muted-foreground))]">{t('noShows.excusedYes')}</span>
                      ) : (
                        <span className="font-medium text-amber-600 dark:text-amber-400">{t('noShows.excusedNo')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-xs text-[hsl(var(--primary))] hover:underline"
                        onClick={() => updateIncident({ id: incident.id, excused: !incident.excused })}
                      >
                        {incident.excused ? t('noShows.unexcuse') : t('noShows.excuse')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<Tab, ReactNode> = {
  Revenue: <RevenueTab />,
  Employees: <EmployeesTab />,
  Services: <ServicesTab />,
  Financial: <FinancialTab />,
  NoShows: <NoShowsTab />,
};

export default function ReportsPage() {
  const t = useTranslations('reports');
  const [activeTab, setActiveTab] = useState<Tab>(TAB_REVENUE);

  const TAB_LABEL: Record<Tab, string> = {
    Revenue: t('tabs.revenue'),
    Employees: t('tabs.employees'),
    Services: t('tabs.services'),
    Financial: t('tabs.financial'),
    NoShows: t('tabs.noShows'),
  };

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-6">
        <div className="flex gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? 'rounded-md bg-[hsl(var(--background))] px-4 py-1.5 text-sm font-medium shadow-sm'
                  : 'rounded-md px-4 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>

        <div>{TAB_CONTENT[activeTab]}</div>
      </div>
    </>
  );
}
