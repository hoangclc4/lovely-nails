'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  useServices,
  useServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
  useDeactivateService,
} from '@/hooks/use-services';
import { ServiceTable } from '@/components/services/service-table';
import { CategoryTable } from '@/components/services/category-table';
import { CategoryDialog } from '@/components/services/category-dialog';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ALL_CATEGORIES_VALUE, SERVICE_PATHS } from '@/constants/service.constants';
import type { Service, ServiceCategory } from '@/types/service';
import type { CreateServiceCategoryDto } from '@/schemas/service.schema';

const ALL_STATUSES_VALUE = 'all';
const ACTIVE_VALUE = 'active';
const INACTIVE_VALUE = 'inactive';

const STATUS_VALUES = [ALL_STATUSES_VALUE, ACTIVE_VALUE, INACTIVE_VALUE] as const;

const SKELETON_ROW_COUNT = 5;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type ActiveTab = 'services' | 'categories';

export default function ServicesPage() {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  const tCommonStatus = useTranslations('common.status');
  const tPagination = useTranslations('common.pagination');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<ActiveTab>('services');
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null);

  const categoryIdFromUrl = searchParams.get('categoryId') ?? undefined;
  const isActiveFromUrl = searchParams.get('isActive');
  const pageFromUrl = Number(searchParams.get('page') ?? DEFAULT_PAGE);

  const isActiveFilter =
    isActiveFromUrl === ACTIVE_VALUE
      ? true
      : isActiveFromUrl === INACTIVE_VALUE
        ? false
        : undefined;

  const { data, isLoading, isError, error } = useServices({
    categoryId: categoryIdFromUrl,
    isActive: isActiveFilter,
    page: pageFromUrl,
    limit: DEFAULT_LIMIT,
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useServiceCategories();
  const categories = categoriesData?.data ?? [];

  const deactivateService = useDeactivateService(deletingService?.id ?? '');
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory(editingCategory?.id ?? '');
  const deleteCategory = useDeleteServiceCategory(deletingCategory?.id ?? '');

  const updateUrlParam = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    const category = value === ALL_CATEGORIES_VALUE ? undefined : value;
    updateUrlParam({ categoryId: category, page: undefined });
  };

  const handleStatusChange = (value: string) => {
    const status = value === ALL_STATUSES_VALUE ? undefined : value;
    updateUrlParam({ isActive: status, page: undefined });
  };

  const handlePageChange = (page: number) => {
    updateUrlParam({ page: String(page) });
  };

  const hasActiveFilters = !!(categoryIdFromUrl ?? isActiveFromUrl);

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const handleDeleteService = (service: Service) => {
    setDeletingService(service);
  };

  const handleConfirmDeleteService = () => {
    if (!deletingService) return;
    deactivateService.mutate(undefined, {
      onSuccess: () => setDeletingService(null),
    });
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleOpenEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = (data: CreateServiceCategoryDto) => {
    if (editingCategory) {
      updateCategory.mutate(data, {
        onSuccess: () => setCategoryDialogOpen(false),
      });
    } else {
      createCategory.mutate(data, {
        onSuccess: () => setCategoryDialogOpen(false),
      });
    }
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    deleteCategory.mutate(undefined, {
      onSuccess: () => setDeletingCategory(null),
    });
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

  const services = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-4">

        {/* Tabs */}
        <div className="border-b border-[hsl(var(--border))]">
          <div className="flex">
            {(['services', 'categories'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
                )}
              >
                {tab === 'services' ? t('tabServices') : t('tabCategories')}
              </button>
            ))}
          </div>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Select
                  value={categoryIdFromUrl ?? ALL_CATEGORIES_VALUE}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('filterByCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORIES_VALUE}>{t('allCategories')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={isActiveFromUrl ?? ALL_STATUSES_VALUE}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder={t('filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((val) => (
                      <SelectItem key={val} value={val}>
                        {val === ALL_STATUSES_VALUE
                          ? t('allStatuses')
                          : tCommonStatus(val as 'active' | 'inactive')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    {tCommon('actions.clearFilters')}
                  </Button>
                )}
              </div>

              <Button asChild>
                <Link href={SERVICE_PATHS.NEW}>{t('addService')}</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]"
                  />
                ))}
              </div>
            ) : (
              <ServiceTable services={services} categories={categories} onDelete={handleDeleteService} />
            )}

            {data && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {total} service{total !== 1 ? 's' : ''} total
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageFromUrl <= 1}
                      onClick={() => handlePageChange(pageFromUrl - 1)}
                    >
                      {tPagination('previous')}
                    </Button>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {tPagination('page')} {pageFromUrl} {tPagination('of')} {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageFromUrl >= totalPages}
                      onClick={() => handlePageChange(pageFromUrl + 1)}
                    >
                      {tPagination('next')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="flex items-center justify-end">
              <Button onClick={handleOpenAddCategory}>{t('categories.addCategory')}</Button>
            </div>

            {isCategoriesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-md bg-[hsl(var(--muted))]"
                  />
                ))}
              </div>
            ) : (
              <CategoryTable
                categories={categories}
                onEdit={handleOpenEditCategory}
                onDelete={handleDeleteCategory}
              />
            )}
          </>
        )}
      </div>

      {/* Delete Service Confirmation Dialog */}
      <Dialog
        open={!!deletingService}
        onOpenChange={(open) => {
          if (!open) setDeletingService(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('deleteConfirm.description', { name: deletingService?.name ?? '' })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingService(null)}
              disabled={deactivateService.isPending}
            >
              {t('deleteConfirm.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteService}
              disabled={deactivateService.isPending}
            >
              {deactivateService.isPending ? tCommon('saving') : t('deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Add/Edit Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('categories.deleteConfirm.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('categories.deleteConfirm.description', { name: deletingCategory?.name ?? '' })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCategory(null)}
              disabled={deleteCategory.isPending}
            >
              {t('categories.deleteConfirm.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? tCommon('saving') : t('categories.deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
