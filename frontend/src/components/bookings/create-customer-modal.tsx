'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCustomer } from '@/hooks/use-customers';
import { createCustomerSchema, type CreateCustomerInput } from '@/schemas/customer.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Customer } from '@/types/customer';

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
}

export function CreateCustomerModal({ open, onOpenChange, onCreated }: CreateCustomerModalProps) {
  const { mutate: createCustomer, isPending, isError, error } = useCreateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (data: CreateCustomerInput) => {
    createCustomer(data, {
      onSuccess: (response) => {
        onCreated(response.data);
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
        </DialogHeader>

        {isError && (
          <p className="text-sm text-[hsl(var(--destructive))]">
            {error instanceof Error ? error.message : 'Failed to create customer.'}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="create-fullName">Full Name</Label>
            <Input id="create-fullName" {...register('fullName')} placeholder="e.g. Jane Doe" />
            {errors.fullName && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="create-phone">Phone</Label>
            <Input id="create-phone" {...register('phone')} placeholder="e.g. 671-123-4567" />
            {errors.phone && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="create-email">Email (optional)</Label>
            <Input id="create-email" type="email" {...register('email')} placeholder="e.g. jane@email.com" />
            {errors.email && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="create-notes">Notes (optional)</Label>
            <Input id="create-notes" {...register('notes')} placeholder="Any notes..." />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
