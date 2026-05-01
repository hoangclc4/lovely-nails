'use client';

import { Menu, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/stores/sidebar-store';
import type { Locale } from '@/i18n/routing';

const LOCALE_EN: Locale = 'en';
const LOCALE_VI: Locale = 'vi';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';
const THEME_SYSTEM = 'system';
const THEME_CYCLE = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM] as const;

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedThemeName = resolveThemeName(mounted ? theme : undefined);
  const currentIndex = THEME_CYCLE.indexOf(resolvedThemeName);
  const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length] ?? THEME_SYSTEM;

  const ThemeIcon = mounted ? getThemeIcon(theme) : Monitor;

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

const LOCALE_COOKIE_NAME = 'ln_locale';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle navigation"
          className="md:hidden rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1
          className="text-xl font-semibold text-[hsl(var(--foreground))]"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-[hsl(var(--primary-foreground))]">
          LN
        </div>
      </div>
    </header>
  );
}
