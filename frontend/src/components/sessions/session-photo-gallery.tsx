'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSessionPhotos, useAddSessionPhoto, useDeleteSessionPhoto } from '@/hooks/use-session-photos';
import { addSessionPhotoSchema, type AddSessionPhotoDto } from '@/schemas/session-photo.schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const MAX_PHOTOS = 4;
const PHOTO_GRID_SKELETON_COUNT = 4;

interface SessionPhotoGalleryProps {
  sessionId: string;
  isEditable: boolean;
}

interface PhotoCardProps {
  id: string;
  photoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  isPortfolio: boolean;
  isEditable: boolean;
  onDelete: (id: string) => void;
  hiddenLabel: string;
}

function PhotoCard({
  id,
  photoUrl,
  thumbnailUrl,
  caption,
  isPortfolio,
  isEditable,
  onDelete,
  hiddenLabel,
}: PhotoCardProps) {
  const imageSrc = thumbnailUrl ?? photoUrl;

  return (
    <div className="relative group rounded-md overflow-hidden border border-[hsl(var(--border))]">
      <img
        src={imageSrc}
        alt={caption ?? ''}
        className="w-full aspect-square object-cover"
      />
      {!isPortfolio && (
        <span className="absolute top-1 left-1 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
          {hiddenLabel}
        </span>
      )}
      {isEditable && (
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="absolute top-1 right-1 rounded-md bg-[hsl(var(--background)/0.8)] p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
          aria-label={hiddenLabel}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      {caption && (
        <p className="px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] truncate">
          {caption}
        </p>
      )}
    </div>
  );
}

export function SessionPhotoGallery({ sessionId, isEditable }: SessionPhotoGalleryProps) {
  const t = useTranslations('sessionPhotos');
  const tCommon = useTranslations('common');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: photos, isLoading } = useSessionPhotos(sessionId);
  const addPhoto = useAddSessionPhoto(sessionId);
  const deletePhoto = useDeleteSessionPhoto(sessionId);

  const form = useForm<AddSessionPhotoDto>({
    resolver: zodResolver(addSessionPhotoSchema),
    defaultValues: {
      isPortfolio: true,
    },
  });

  const handleAdd = (data: AddSessionPhotoDto) => {
    const payload: AddSessionPhotoDto = {
      ...data,
      thumbnailUrl: data.thumbnailUrl || undefined,
      caption: data.caption || undefined,
    };
    addPhoto.mutate(payload, {
      onSuccess: () => {
        form.reset({ isPortfolio: true });
        setShowAddDialog(false);
      },
    });
  };

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDeleteId) return;
    deletePhoto.mutate(pendingDeleteId, {
      onSuccess: () => setPendingDeleteId(null),
    });
  };

  const handleCloseAddDialog = () => {
    form.reset({ isPortfolio: true });
    setShowAddDialog(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: PHOTO_GRID_SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-md bg-[hsl(var(--muted))]"
          />
        ))}
      </div>
    );
  }

  const photoList = photos ?? [];
  const canAddMore = photoList.length < MAX_PHOTOS;

  return (
    <>
      <div className="space-y-3">
        {isEditable && canAddMore && (
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('addPhoto')}
            </Button>
          </div>
        )}

        {photoList.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noPhotos')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photoList.map((photo) => (
              <PhotoCard
                key={photo.id}
                id={photo.id}
                photoUrl={photo.photoUrl}
                thumbnailUrl={photo.thumbnailUrl}
                caption={photo.caption}
                isPortfolio={photo.isPortfolio}
                isEditable={isEditable}
                onDelete={handleDeleteRequest}
                hiddenLabel={t('hiddenFromPortfolio')}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addPhoto')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('form.photoUrl')}</label>
              <Input
                {...form.register('photoUrl')}
                placeholder={t('form.photoUrlPlaceholder')}
              />
              {form.formState.errors.photoUrl && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.photoUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('form.thumbnailUrl')}</label>
              <Input
                {...form.register('thumbnailUrl')}
                placeholder={t('form.thumbnailUrlPlaceholder')}
              />
              {form.formState.errors.thumbnailUrl && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.thumbnailUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('form.caption')}</label>
              <textarea
                {...form.register('caption')}
                rows={2}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {form.formState.errors.caption && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.caption.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPortfolio"
                {...form.register('isPortfolio')}
                className="h-4 w-4 rounded border-[hsl(var(--border))]"
              />
              <label htmlFor="isPortfolio" className="text-sm">
                {t('form.includeInPortfolio')}
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={addPhoto.isPending}>
                {addPhoto.isPending ? t('form.adding') : t('addPhoto')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseAddDialog}>
                {tCommon('actions.cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('deleteDialog.message')}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePhoto.isPending}
            >
              {deletePhoto.isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
            </Button>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              {tCommon('actions.cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
