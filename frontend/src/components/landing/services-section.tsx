'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePublicServices } from '@/hooks/use-public-services';
import { cn } from '@/lib/utils';
import type { PublicService } from '@/types/public';

const SALON_PHONE = '+16716466244';
const PRICE_DECIMAL_PLACES = 2;
const SKELETON_COUNT = 6;
const SKELETON_INDICES = Array.from({ length: SKELETON_COUNT }, (_, i) => i);
const ALL_CATEGORIES_ID = '__all__';

function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 animate-pulse">
      <div className="h-5 w-20 bg-[hsl(var(--muted))] rounded-full mb-4" />
      <div className="h-6 w-3/4 bg-[hsl(var(--muted))] rounded mb-3" />
      <div className="h-4 w-full bg-[hsl(var(--muted))] rounded mb-2" />
      <div className="h-4 w-2/3 bg-[hsl(var(--muted))] rounded mb-6" />
      <div className="flex items-center justify-between">
        <div className="h-8 w-16 bg-[hsl(var(--muted))] rounded" />
        <div className="h-8 w-20 bg-[hsl(var(--muted))] rounded-full" />
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: PublicService }) {
  const price = parseFloat(service.price);
  const formattedPrice = Number.isNaN(price) ? service.price : `$${price.toFixed(PRICE_DECIMAL_PLACES)}`;

  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 flex flex-col shadow-soft hover:shadow-soft-md transition-shadow">
      {service.categoryName && (
        <span className="inline-block self-start rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-3 py-1 text-xs font-medium mb-4">
          {service.categoryName}
        </span>
      )}

      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
        {service.name}
      </h3>

      {service.description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2 flex-1">
          {service.description}
        </p>
      )}

      {!service.description && <div className="flex-1" />}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[hsl(var(--primary))]">
            {formattedPrice}
          </span>
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] px-2.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {service.durationMinutes} min
          </span>
        </div>
        <a
          href={`tel:${SALON_PHONE}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--primary))] px-4 py-1.5 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

interface Category {
  id: string;
  name: string;
}

function CategoryTabs({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations('landing');

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      <button
        onClick={() => onSelect(ALL_CATEGORIES_ID)}
        className={cn(
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          selected === ALL_CATEGORIES_ID
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
        )}
      >
        {t('services.allCategories')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            selected === cat.id
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

export function ServicesSection() {
  const t = useTranslations('landing');
  const { data: services, isLoading, isError } = usePublicServices();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_ID);

  const categories: Category[] = services
    ? Array.from(
        new Map(
          services
            .filter((s) => s.categoryId !== null && s.categoryName !== null)
            .map((s) => [s.categoryId!, { id: s.categoryId!, name: s.categoryName! }]),
        ).values(),
      )
    : [];

  const filtered =
    selectedCategory === ALL_CATEGORIES_ID
      ? (services ?? [])
      : (services ?? []).filter((s) => s.categoryId === selectedCategory);

  return (
    <section id="services" className="py-24 bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t('services.title')}
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKELETON_INDICES.map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-[hsl(var(--destructive))]">{t('services.error')}</p>
        )}

        {!isLoading && !isError && services && services.length === 0 && (
          <p className="text-center text-[hsl(var(--muted-foreground))]">{t('services.empty')}</p>
        )}

        {!isLoading && !isError && services && services.length > 0 && (
          <>
            {categories.length > 0 && (
              <CategoryTabs
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
