'use client';

import Image from 'next/image';
import { Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/stores/sidebar-store';
import { getStoredAccessToken } from '@/stores/auth.store';
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
const DEFAULT_USER_INITIALS = 'U';
const USER_NAME_FALLBACK = 'User';
const JWT_PAYLOAD_INDEX = 1;
const BASE64_URL_DASH = /-/g;
const BASE64_URL_UNDERSCORE = /_/g;
const BASE64_STANDARD_PLUS = '+';
const BASE64_STANDARD_SLASH = '/';


interface TokenPayload {
  name?: string;
  email?: string;
  sub?: string;
}

function getInitialsFromName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) return DEFAULT_USER_INITIALS;

  const nameParts = trimmedName.split(' ').filter(Boolean);
  if (!nameParts.length) return DEFAULT_USER_INITIALS;

  const firstInitial = nameParts[0]?.[0] ?? DEFAULT_USER_INITIALS;
  const secondInitial = nameParts[1]?.[0] ?? '';

  return `${firstInitial}${secondInitial}`.toUpperCase();
}

function parseTokenPayload(token: string): TokenPayload | null {
  const tokenParts = token.split('.');
  const payloadPart = tokenParts[JWT_PAYLOAD_INDEX];
  if (!payloadPart) return null;

  try {
    const base64Payload = payloadPart
      .replace(BASE64_URL_DASH, BASE64_STANDARD_PLUS)
      .replace(BASE64_URL_UNDERSCORE, BASE64_STANDARD_SLASH);

    const decodedPayload = atob(base64Payload);
    const parsedPayload = JSON.parse(decodedPayload) as TokenPayload;
    return parsedPayload;
  } catch {
    return null;
  }
}

function getUserDisplayName(payload: TokenPayload | null): string {
  if (!payload) return USER_NAME_FALLBACK;
  if (payload.name) return payload.name;
  if (payload.email) return payload.email;
  if (payload.sub) return payload.sub;
  return USER_NAME_FALLBACK;
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

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { isCollapsed, toggle, toggleCollapsed } = useSidebar();
  const desktopToggleLabel = isCollapsed ? 'Expand navigation' : 'Collapse navigation';
  const DesktopToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;
  const [userInitials, setUserInitials] = useState(DEFAULT_USER_INITIALS);
  const [userDisplayName, setUserDisplayName] = useState(USER_NAME_FALLBACK);

  useEffect(() => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      setUserInitials(DEFAULT_USER_INITIALS);
      setUserDisplayName(USER_NAME_FALLBACK);
      return;
    }

    const payload = parseTokenPayload(accessToken);
    const resolvedName = getUserDisplayName(payload);
    setUserDisplayName(resolvedName);
    setUserInitials(getInitialsFromName(resolvedName));
  }, []);

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
        <button
          onClick={toggleCollapsed}
          aria-label={desktopToggleLabel}
          title={desktopToggleLabel}
          className="hidden md:inline-flex rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
        >
          <DesktopToggleIcon className="h-5 w-5" />
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
        <div
          aria-label={userDisplayName}
          title={userDisplayName}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-semibold text-[hsl(var(--foreground))]"
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
