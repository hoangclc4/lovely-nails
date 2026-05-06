'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useSession,
  useCompleteSession,
  useCancelSession,
  useAddSessionService,
  useAddSessionAddOn,
  useExtendSessionTime,
  useUpdateSessionCustomer,
} from '@/hooks/use-sessions';
import { useCustomers } from '@/hooks/use-customers';
import { useServices } from '@/hooks/use-services';
import { useEmployee } from '@/hooks/use-employees';
import { useBooking } from '@/hooks/use-bookings';
import { Header } from '@/components/layout/header';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { SessionStatusBadge } from '@/components/sessions/session-status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  addSessionServiceSchema,
  addSessionAddOnSchema,
  addTimeExtensionSchema,
  type AddSessionServiceDto,
  type AddSessionAddOnDto,
  type AddTimeExtensionDto,
} from '@/schemas/session.schema';
import { useTranslations } from 'next-intl';
import { SESSION_STATUS, SESSION_PATHS } from '@/constants/session.constants';
import { SessionPhotoGallery } from '@/components/sessions/session-photo-gallery';


export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('sessions');
  const id = params.id;

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showAddAddOnDialog, setShowAddAddOnDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showAssignCustomerDialog, setShowAssignCustomerDialog] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const tPhotos = useTranslations('sessionPhotos');

  const { data: session, isLoading, isError } = useSession(id);
  const { data: servicesData } = useServices({ isActive: true });
  const { data: employeeData } = useEmployee(session?.employeeId ?? '');
  const { data: bookingData } = useBooking(session?.bookingId ?? '');
  const { data: customersData } = useCustomers({ search: customerSearch, limit: 50 });

  const completeSession = useCompleteSession(id);
  const cancelSession = useCancelSession(id);
  const addService = useAddSessionService(id);
  const addAddOn = useAddSessionAddOn(id);
  const extendTime = useExtendSessionTime(id);
  const updateCustomer = useUpdateSessionCustomer(id);

  const addServiceForm = useForm<AddSessionServiceDto>({
    resolver: zodResolver(addSessionServiceSchema),
  });

  const addAddOnForm = useForm<AddSessionAddOnDto>({
    resolver: zodResolver(addSessionAddOnSchema),
  });

  const extendForm = useForm<AddTimeExtensionDto>({
    resolver: zodResolver(addTimeExtensionSchema),
  });

  const services = servicesData?.data ?? [];

  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));

  const handleComplete = () => {
    completeSession.mutate(undefined, {
      onSuccess: () => router.push(SESSION_PATHS.ROOT),
    });
  };

  const handleCancel = () => {
    cancelSession.mutate(undefined, {
      onSuccess: () => {
        setShowCancelDialog(false);
        router.push(SESSION_PATHS.ROOT);
      },
    });
  };

  const handleAddService = (data: AddSessionServiceDto) => {
    addService.mutate(data, {
      onSuccess: () => {
        addServiceForm.reset();
        setShowAddServiceDialog(false);
      },
    });
  };

  const handleAddAddOn = (data: AddSessionAddOnDto) => {
    addAddOn.mutate(data, {
      onSuccess: () => {
        addAddOnForm.reset();
        setShowAddAddOnDialog(false);
      },
    });
  };

  const handleExtendTime = (data: AddTimeExtensionDto) => {
    extendTime.mutate(data, {
      onSuccess: () => {
        extendForm.reset();
        setShowExtendDialog(false);
      },
    });
  };

  const handleAssignCustomer = () => {
    if (selectedCustomerId === null) return;
    updateCustomer.mutate(
      { customerId: selectedCustomerId },
      {
        onSuccess: () => {
          setShowAssignCustomerDialog(false);
          setCustomerSearch('');
          setSelectedCustomerId(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </>
    );
  }

  if (isError || !session) {
    return (
      <>
        <Header title={t('title')} />
        <div className="p-6">
          <p className="text-sm text-red-500">{t('notFound')}</p>
        </div>
      </>
    );
  }

  const isInProgress = session.status === SESSION_STATUS.IN_PROGRESS;

  const totalServicesAmount = (session.services ?? []).reduce(
    (sum, s) => sum + parseFloat(s.priceAtTime),
    0,
  );
  const totalAddOnsAmount = (session.addOns ?? []).reduce(
    (sum, a) => sum + parseFloat(a.priceAtTime),
    0,
  );
  const totalAmount = totalServicesAmount + totalAddOnsAmount;

  const totalExtensionMinutes = (session.extensions ?? []).reduce(
    (sum, e) => sum + e.extraMinutes,
    0,
  );

  return (
    <>
      <Header title={t('title')} />
      <div className="p-6 max-w-2xl space-y-6">
        <div className="rounded-md border border-[hsl(var(--border))] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.sessionNumber')}</span>
            <span className="font-mono text-sm font-medium">{session.sessionNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.status')}</span>
            <SessionStatusBadge status={session.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.employee')}</span>
            <span className="text-sm">{employeeData?.data?.fullName ?? session.employeeId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.customer')}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{session.customerName ?? t('detail.guest')}</span>
              {session.customerId === null && (
                <Button size="sm" variant="outline" onClick={() => setShowAssignCustomerDialog(true)}>
                  {t('detail.assignCustomer')}
                </Button>
              )}
            </div>
          </div>
          {session.bookingId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.booking')}</span>
              <span className="text-sm">{bookingData ? `#${bookingData.bookingNumber} ${bookingData.startTime.slice(0, 5)}` : session.bookingId}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.started')}</span>
            <span className="text-sm">{formatDateTime(session.startTime)}</span>
          </div>
          {session.endTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.ended')}</span>
              <span className="text-sm">{formatDateTime(session.endTime)}</span>
            </div>
          )}
          {session.notes && (
            <div>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.notes')}</span>
              <p className="mt-1 text-sm">{session.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t('detail.services')}</h2>
            {isInProgress && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddServiceDialog(true)}
              >
                {t('detail.addService')}
              </Button>
            )}
          </div>
          {(session.services ?? []).length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.noServices')}</p>
          ) : (
            <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
              {(session.services ?? []).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span className="flex-1">
                    {serviceNameMap.get(s.serviceId) ?? s.serviceId}
                  </span>
                  <div className="flex items-center gap-4">
                    <span>{s.durationMinutes} min</span>
                    <span className="font-medium">{formatCurrency(parseFloat(String(s.priceAtTime)))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t('detail.addOns')}</h2>
            {isInProgress && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddAddOnDialog(true)}
              >
                {t('detail.addAddOn')}
              </Button>
            )}
          </div>
          {(session.addOns ?? []).length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.noAddOns')}</p>
          ) : (
            <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
              {(session.addOns ?? []).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span className="flex-1">
                    {a.name}
                  </span>
                  <span className="font-medium">{formatCurrency(parseFloat(String(a.priceAtTime)))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t('detail.timeExtensions')}</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExtendDialog(true)}
            >
              {t('detail.addExtension')}
            </Button>
          </div>
          {(session.extensions ?? []).length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('detail.noExtensions')}</p>
          ) : (
            <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
              {(session.extensions ?? []).map((ext) => (
                <div key={ext.id} className="px-4 py-2 text-sm space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">+{ext.extraMinutes} min</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(ext.createdAt)}
                    </span>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))]">{ext.reason}</p>
                </div>
              ))}
              <div className="px-4 py-2 text-sm font-medium">
                {t('detail.totalExtra')} {totalExtensionMinutes} min
              </div>
            </div>
          )}
        </div>

        <div className="rounded-md border border-[hsl(var(--border))] p-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>{t('detail.totalAmount')}</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">{tPhotos('title')}</h2>
          <SessionPhotoGallery sessionId={id} isEditable={true} />
        </div>

        {isInProgress && (
          <div className="flex gap-3">
            <Button onClick={handleComplete} disabled={completeSession.isPending}>
              {completeSession.isPending ? t('detail.completing') : t('detail.completeSession')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
            >
              {t('detail.cancelSession')}
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={showAssignCustomerDialog}
        onOpenChange={(open) => {
          setShowAssignCustomerDialog(open);
          if (!open) {
            setCustomerSearch('');
            setSelectedCustomerId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assignCustomerDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t('assignCustomerDialog.search')}
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              autoComplete="off"
            />
            <div className="max-h-52 overflow-y-auto rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
              {(customersData?.data ?? []).length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  {t('assignCustomerDialog.noResults')}
                </p>
              ) : (
                (customersData?.data ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors',
                      selectedCustomerId === c.id
                        ? 'bg-[hsl(var(--primary)/0.06)]'
                        : 'hover:bg-[hsl(var(--accent))]',
                    )}
                  >
                    <span className="font-medium">{c.fullName}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{c.phone}</span>
                  </button>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAssignCustomer}
                disabled={selectedCustomerId === null || updateCustomer.isPending}
              >
                {updateCustomer.isPending
                  ? t('assignCustomerDialog.assigning')
                  : t('assignCustomerDialog.assign')}
              </Button>
              <Button variant="outline" onClick={() => setShowAssignCustomerDialog(false)}>
                {t('cancelDialog.back')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('cancelDialog.message')}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelSession.isPending}
            >
              {cancelSession.isPending ? t('cancelDialog.cancelling') : t('cancelDialog.confirm')}
            </Button>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t('cancelDialog.back')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddServiceDialog}
        onOpenChange={(open) => {
          setShowAddServiceDialog(open);
          if (!open) setServiceSearch('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addServiceDialog.title')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={addServiceForm.handleSubmit(handleAddService)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('addServiceDialog.service')}</label>
              <Input
                placeholder={t('addServiceDialog.searchPlaceholder')}
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                autoComplete="off"
              />
              <div className="max-h-52 overflow-y-auto rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
                {services
                  .filter((svc) =>
                    svc.name.toLowerCase().includes(serviceSearch.toLowerCase()),
                  )
                  .map((svc) => {
                    const selected = addServiceForm.watch('serviceId') === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => addServiceForm.setValue('serviceId', svc.id, { shouldValidate: true })}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                          selected
                            ? 'bg-[hsl(var(--primary)/0.06)]'
                            : 'hover:bg-[hsl(var(--accent))]',
                        )}
                      >
                        <span className="flex-1 font-medium">{svc.name}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {formatCurrency(parseFloat(String(svc.price)))}
                        </span>
                      </button>
                    );
                  })}
              </div>
              {addServiceForm.formState.errors.serviceId && (
                <p className="text-xs text-red-500">
                  {addServiceForm.formState.errors.serviceId.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={addService.isPending}>
                {addService.isPending ? t('addServiceDialog.adding') : t('addServiceDialog.add')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddServiceDialog(false)}
              >
                {t('cancelDialog.back')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAddOnDialog} onOpenChange={setShowAddAddOnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addAddOnDialog.title')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={addAddOnForm.handleSubmit(handleAddAddOn)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('addAddOnDialog.name')}</label>
              <input
                {...addAddOnForm.register('name')}
                placeholder={t('addAddOnDialog.namePlaceholder')}
                className="w-full h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {addAddOnForm.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {addAddOnForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('addAddOnDialog.price')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...addAddOnForm.register('price', { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {addAddOnForm.formState.errors.price && (
                <p className="text-xs text-red-500">
                  {addAddOnForm.formState.errors.price.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={addAddOn.isPending}>
                {addAddOn.isPending ? t('addServiceDialog.adding') : t('addServiceDialog.add')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddAddOnDialog(false)}
              >
                {t('cancelDialog.back')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('extendDialog.title')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={extendForm.handleSubmit(handleExtendTime)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('extendDialog.extraMinutes')}</label>
              <div className="flex gap-2 mb-1">
                {[10, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => extendForm.setValue('extraMinutes', mins, { shouldValidate: true })}
                    className="rounded-md border border-[hsl(var(--border))] px-3 py-1 text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    +{mins}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                {...extendForm.register('extraMinutes', { valueAsNumber: true })}
                className="w-full h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {extendForm.formState.errors.extraMinutes && (
                <p className="text-xs text-red-500">
                  {extendForm.formState.errors.extraMinutes.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('extendDialog.reason')}</label>
              <textarea
                {...extendForm.register('reason')}
                rows={3}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {extendForm.formState.errors.reason && (
                <p className="text-xs text-red-500">
                  {extendForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={extendTime.isPending}>
                {extendTime.isPending ? t('extendDialog.saving') : t('extendDialog.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExtendDialog(false)}
              >
                {t('cancelDialog.back')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
