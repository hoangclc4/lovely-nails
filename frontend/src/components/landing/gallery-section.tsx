import { getTranslations } from 'next-intl/server';

const PICSUM_BASE = 'https://picsum.photos/seed';

interface GalleryImage {
  seed: string;
  width: number;
  height: number;
}

const GALLERY_IMAGES: GalleryImage[] = [
  { seed: 'nails1', width: 400, height: 600 },
  { seed: 'nails2', width: 600, height: 400 },
  { seed: 'nails3', width: 500, height: 500 },
  { seed: 'nails4', width: 400, height: 600 },
  { seed: 'nails5', width: 600, height: 400 },
  { seed: 'nails6', width: 500, height: 500 },
  { seed: 'nails7', width: 400, height: 600 },
  { seed: 'nails8', width: 600, height: 400 },
  { seed: 'nails9', width: 500, height: 500 },
];

export async function GallerySection() {
  const t = await getTranslations('landing');

  return (
    <section id="gallery" className="py-24 bg-[hsl(var(--muted))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t('gallery.title')}
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {GALLERY_IMAGES.map((img) => (
            <div
              key={img.seed}
              className="break-inside-avoid mb-4 relative overflow-hidden rounded-2xl group cursor-pointer"
            >
              <img
                src={`${PICSUM_BASE}/${img.seed}/${img.width}/${img.height}`}
                alt={t('gallery.caption')}
                width={img.width}
                height={img.height}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                <span className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4 text-white text-sm font-medium">
                  {t('gallery.caption')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
