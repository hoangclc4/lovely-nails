'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCustomers } from '@/hooks/use-customers';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEBOUNCE_MS = 300;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export default function CustomersPage() {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchFromUrl = searchParams.get('search') ?? '';
  const pageFromUrl = Number(searchParams.get('page') ?? DEFAULT_PAGE);

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, error } = useCustomers({
    search: searchFromUrl || undefined,
    page: pageFromUrl,
    limit: DEFAULT_LIMIT,
  });

  const updateUrlParam = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      updateUrlParam({ search: value || undefined, page: undefined });
    }, DEBOUNCE_MS);

    setDebounceTimer(timer);
  };

  const handlePageChange = (page: number) => {
    updateUrlParam({ page: String(page) });
  };

  const hasActiveFilters = !!searchFromUrl;

  const handleClearFilters = () => {
    setSearchInput('');
    if (debounceTimer) clearTimeout(debounceTimer);
    router.push(pathname);
  };

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

  const customers = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                {tCommon('actions.clearFilters')}
              </Button>
            )}
          </div>
          <Button asChild>
            <Link href="/customers/new">{t('addCustomer')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]"
              />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <p className="text-[hsl(var(--muted-foreground))] text-sm py-8 text-center">
            {t('noCustomers')}
          </p>
        ) : (
          <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <th className="px-4 py-3 text-left font-medium">{t('columns.name')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.phone')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.email')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.totalVisits')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.totalSpent')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.lastVisit')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {customer.fullName}
                        {customer.isFlagged && (
                          <span
                            title={t('flaggedTooltip')}
                            className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          >
                            {t('flagged')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {customer.email ?? '—'}
                    </td>
                    <td className="px-4 py-3">{customer.totalVisits}</td>
                    <td className="px-4 py-3">{customer.totalSpent}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {customer.lastVisitDate
                        ? new Date(customer.lastVisitDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/customers/${customer.id}`}>{t('view')}</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t('totalCustomers', { count: total })}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageFromUrl <= 1}
                  onClick={() => handlePageChange(pageFromUrl - 1)}
                >
                  {t('pagination.previous')}
                </Button>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t('pagination.page')} {pageFromUrl} {t('pagination.of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageFromUrl >= totalPages}
                  onClick={() => handlePageChange(pageFromUrl + 1)}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
