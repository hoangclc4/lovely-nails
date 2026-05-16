import { getTranslations } from 'next-intl/server';
import { Phone } from 'lucide-react';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1920&q=80';
const SALON_PHONE = '+16716466244';

async function HeroCta() {
  const t = await getTranslations('landing');

  return (
    <a
      href={`tel:${SALON_PHONE}`}
      className="inline-flex items-center gap-3 justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-8 py-4 text-lg font-semibold shadow-lg hover:bg-[hsl(var(--primary)/0.9)] transition-colors"
    >
      <Phone className="h-5 w-5" />
      {t('hero.cta')}
    </a>
  );
}

export async function HeroSection() {
  const t = await getTranslations('landing');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-gray-900 dark:via-rose-950 dark:to-gray-900">
      <img
        src={HERO_IMAGE_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-pink-100/80 via-transparent to-pink-50/40 dark:from-gray-900/80 dark:via-transparent dark:to-gray-900/40" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[hsl(var(--foreground))] mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {t('hero.title')}
        </h1>

        <p className="text-xl text-[hsl(var(--muted-foreground))] mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="flex justify-center mb-16">
          <HeroCta />
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
            <div
              className="text-3xl font-bold text-[hsl(var(--primary))]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('hero.stat1Value')}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {t('hero.stat1Label')}
            </div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
            <div
              className="text-3xl font-bold text-[hsl(var(--primary))]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('hero.stat2Value')}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {t('hero.stat2Label')}
            </div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
            <div
              className="text-3xl font-bold text-[hsl(var(--primary))]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('hero.stat3Value')}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {t('hero.stat3Label')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
