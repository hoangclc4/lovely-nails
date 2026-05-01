'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useService, useUpdateService, useDeactivateService, useDeleteService, useServiceCategories } from '@/hooks/use-services';
import type { CreateServiceDto } from '@/schemas/service.schema';
import { ServiceForm } from '@/components/services/service-form';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SERVICE_PATHS } from '@/constants/service.constants';

const SKELETON_CARD_COUNT = 2;

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const t = useTranslations('services');

  const { id } = use(params);

  const { data: service, isLoading, isError, error } = useService(id);
  const { mutate: updateService, isPending: isUpdating, error: updateError } = useUpdateService(id);
  const { mutate: deactivateService, isPending: isDeactivating } = useDeactivateService(id);
  const { mutate: deleteService, isPending: isDeleting, error: deleteError } = useDeleteService(id);
  const { data: categoriesData } = useServiceCategories({ isActive: true });

  const router = useRouter();
  const categories = categoriesData?.data ?? [];

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-4">
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isError || !service) {
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

  const handleUpdate = (data: CreateServiceDto) => {
    updateService(data, {
      onSuccess: () => {
        router.push(SERVICE_PATHS.LIST);
      },
    });
  };

  const handleDeactivate = () => {
    deactivateService(undefined, {
      onSuccess: () => {
        router.push(SERVICE_PATHS.LIST);
      },
    });
  };

  const handleReactivate = () => {
    updateService({ isActive: true }, {
      onSuccess: () => {
        router.push(SERVICE_PATHS.LIST);
      },
    });
  };

  const handleDelete = () => {
    deleteService(undefined, {
      onSuccess: () => {
        router.push(SERVICE_PATHS.LIST);
      },
    });
  };

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Service Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Name</span>
                <p className="font-medium">{service.name}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Price</span>
                <p className="font-medium">{formatCurrency(parseFloat(String(service.price)))}</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Duration</span>
                <p className="font-medium">{service.durationMinutes} min</p>
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Status</span>
                <p className="font-medium">{service.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            {service.isActive && (
              <div className="pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeactivating}>
                      {isDeactivating ? 'Deactivating...' : 'Deactivate Service'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deactivate Service</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to deactivate &quot;{service.name}&quot;? It will no longer be available for bookings.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
                        {isDeactivating ? 'Deactivating...' : 'Confirm Deactivate'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {!service.isActive && (
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={handleReactivate} disabled={isUpdating}>
                  {isUpdating ? 'Activating...' : 'Activate Service'}
                </Button>
              </div>
            )}

            <div className="pt-2 border-t border-[hsl(var(--border))]">
              {deleteError && (
                <p className="mb-2 text-sm text-[hsl(var(--destructive))]">
                  {deleteError instanceof Error ? deleteError.message : 'Failed to delete service.'}
                </p>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]" disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete Service'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Service</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete &quot;{service.name}&quot;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Service</CardTitle>
          </CardHeader>
          <CardContent>
            {updateError && (
              <div className="mb-4 rounded-md border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
                {updateError instanceof Error ? updateError.message : 'Failed to update service.'}
              </div>
            )}
            <ServiceForm
              defaultValues={{
                name: service.name,
                description: service.description ?? undefined,
                price: service.price,
                durationMinutes: service.durationMinutes,
                categoryId: service.categoryId ?? undefined,
                isActive: service.isActive,
                imageUrl: service.imageUrl,
              }}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              categories={categories}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
