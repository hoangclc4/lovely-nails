'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';

const LOCALE_EN: Locale = 'en';
const LOCALE_VI: Locale = 'vi';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';
const THEME_SYSTEM = 'system';
const THEME_CYCLE = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM] as const;
const LOCALE_COOKIE_NAME = 'ln_locale';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const BOOKING_SECTION_ID = 'booking';

type ThemeName = (typeof THEME_CYCLE)[number];

function getThemeIcon(theme: string | undefined): React.ComponentType<{ className?: string }> {
  if (theme === THEME_DARK) return Moon;
  if (theme === THEME_LIGHT) return Sun;
  return Monitor;
}

function resolveThemeName(theme: string | undefined): ThemeName {
  if (theme === THEME_DARK) return THEME_DARK;
  if (theme === THEME_LIGHT) return THEME_LIGHT;
  return THEME_SYSTEM;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('theme');

  const resolvedThemeName = resolveThemeName(theme);
  const currentIndex = THEME_CYCLE.indexOf(resolvedThemeName);
  const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length] ?? THEME_SYSTEM;
  const ThemeIcon = getThemeIcon(theme);

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      aria-label={t('toggle')}
      title={t(resolvedThemeName)}
      className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
    >
      <ThemeIcon className="h-4 w-4" />
    </button>
  );
}

function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleSwitch = (newLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}`;
    router.refresh();
  };

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-[hsl(var(--border))] text-xs">
      <button
        onClick={() => handleLocaleSwitch(LOCALE_EN)}
        className={cn(
          'px-2.5 py-1 font-medium transition-colors',
          locale === LOCALE_EN
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
        )}
      >
        EN
      </button>
      <button
        onClick={() => handleLocaleSwitch(LOCALE_VI)}
        className={cn(
          'px-2.5 py-1 font-medium transition-colors',
          locale === LOCALE_VI
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
        )}
      >
        VI
      </button>
    </div>
  );
}

export function NavBar() {
  const t = useTranslations('landing');

  const scrollToBooking = () => {
    document.getElementById(BOOKING_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <span
            className="text-2xl font-semibold text-[hsl(var(--primary))]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Lovely Nails
          </span>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button size="sm" onClick={scrollToBooking}>
              {t('nav.bookNow')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
