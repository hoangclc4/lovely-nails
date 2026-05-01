'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCreateService, useServiceCategories } from '@/hooks/use-services';
import type { CreateServiceDto } from '@/schemas/service.schema';
import { ServiceForm } from '@/components/services/service-form';
import { Header } from '@/components/layout/header';
import { SERVICE_PATHS } from '@/constants/service.constants';

export default function NewServicePage() {
  const t = useTranslations('services');

  const router = useRouter();
  const { mutate: createService, isPending, isError, error } = useCreateService();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useServiceCategories({
    isActive: true,
  });

  const categories = categoriesData?.data ?? [];

  const handleSubmit = (data: CreateServiceDto) => {
    createService(data, {
      onSuccess: () => {
        router.push(SERVICE_PATHS.LIST);
      },
    });
  };

  return (
    <>
      <Header title={t('addService')} />
      <div className="p-6 max-w-lg">
        {isError && (
          <div className="mb-4 rounded-md border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : 'Failed to create service.'}
          </div>
        )}

        {isCategoriesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
            ))}
          </div>
        ) : (
          <ServiceForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            categories={categories}
          />
        )}
      </div>
    </>
  );
}
