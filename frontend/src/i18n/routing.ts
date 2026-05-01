import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi'] as const,
  defaultLocale: 'en',
  localePrefix: 'never',
  localeCookie: {
    name: 'ln_locale',
  },
});

export type Locale = (typeof routing.locales)[number];
