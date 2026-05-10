'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Calculator,
  Scissors,
  Users,
  Sparkles,
  Banknote,
  LayoutDashboard,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  UserRound,
  Settings,
  LogOut,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  buildLogoSrc,
  DARK_LOGO_SUFFIX,
  getDesktopLogoBaseName,
  getMobileLogoBaseName,
  LIGHT_LOGO_SUFFIX,
} from '@/lib/sidebar-logo';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/stores/sidebar-store';
import { useLogout } from '@/hooks/use-auth';

type NavKey =
  | 'dashboard'
  | 'reports'
  | 'employees'
  | 'customers'
  | 'bookings'
  | 'services'
  | 'sessions'
  | 'tips'
  | 'salaries'
  | 'settings';

const LOGO_ALT = 'Lovely Nails';
const MOBILE_LOGO_WIDTH = 72;
const MOBILE_LOGO_HEIGHT = 48;
const DESKTOP_LOGO_WIDTH = 160;
const DESKTOP_LOGO_HEIGHT = 44;

const NAV_ITEMS: Array<{ key: NavKey; href: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'reports', href: '/reports', icon: BarChart3 },
  { key: 'employees', href: '/employees', icon: Users },
  { key: 'customers', href: '/customers', icon: UserRound },
  { key: 'bookings', href: '/bookings', icon: CalendarDays },
  { key: 'services', href: '/services', icon: Scissors },
  { key: 'sessions', href: '/sessions', icon: Sparkles },
  { key: 'tips', href: '/tips', icon: Banknote },
  { key: 'salaries', href: '/salaries', icon: Calculator },
  { key: 'settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isCollapsed, close, toggleCollapsed } = useSidebar();
  const { logout } = useLogout();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const desktopLogoBaseName = getDesktopLogoBaseName(isCollapsed);
  const mobileLogoBaseName = getMobileLogoBaseName();


  const DesktopToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col',
        'md:w-64',
        'bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))]',
        'transition-[transform,width] duration-300 ease-in-out',
        'md:static md:translate-x-0',
        isCollapsed ? 'md:w-20' : '',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))]',
          isCollapsed ? 'px-3' : 'px-5',
        )}
      >
        <div className={cn('min-w-0', isCollapsed ? 'md:w-full' : '')}>
          <div className="md:hidden">
            <Image
              src={buildLogoSrc(mobileLogoBaseName, DARK_LOGO_SUFFIX)}
              alt={LOGO_ALT}
              width={MOBILE_LOGO_WIDTH}
              height={MOBILE_LOGO_HEIGHT}
              className="h-auto w-auto max-h-12 dark:hidden"
              unoptimized
            />
            <Image
              src={buildLogoSrc(mobileLogoBaseName, LIGHT_LOGO_SUFFIX)}
              alt={LOGO_ALT}
              width={MOBILE_LOGO_WIDTH}
              height={MOBILE_LOGO_HEIGHT}
              className="hidden h-auto w-auto max-h-12 dark:block"
              unoptimized
            />
          </div>
          <div className="hidden md:block">
            <Image
              src={buildLogoSrc(desktopLogoBaseName, DARK_LOGO_SUFFIX)}
              alt={LOGO_ALT}
              width={DESKTOP_LOGO_WIDTH}
              height={DESKTOP_LOGO_HEIGHT}
              className="h-auto w-full max-w-40 dark:hidden"
              unoptimized
            />
            <Image
              src={buildLogoSrc(desktopLogoBaseName, LIGHT_LOGO_SUFFIX)}
              alt={LOGO_ALT}
              width={DESKTOP_LOGO_WIDTH}
              height={DESKTOP_LOGO_HEIGHT}
              className="hidden h-auto w-full max-w-40 dark:block"
              unoptimized
            />
          </div>
        </div>
       
        <button
          onClick={close}
          aria-label="Close navigation"
          className="md:hidden rounded-full p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                'flex items-center rounded-full text-sm font-medium transition-colors',
                isCollapsed ? 'md:justify-center md:px-2 gap-3 px-4 py-2.5' : 'gap-3 px-4 py-2.5',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
              )}
              title={isCollapsed ? tNav(item.key) : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn(isCollapsed ? 'md:hidden' : '')}>{tNav(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="border-t border-[hsl(var(--sidebar-border))] pt-3 space-y-0.5">
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center rounded-full py-2.5 text-sm font-medium text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors',
              isCollapsed ? 'md:justify-center md:px-2 gap-3 px-4' : 'gap-3 px-4',
            )}
            title={isCollapsed ? tCommon('signOut') : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(isCollapsed ? 'md:hidden' : '')}>{tCommon('signOut')}</span>
          </button>
          <p className={cn('px-4 text-xs text-[hsl(var(--muted-foreground))]', isCollapsed ? 'md:hidden' : '')}>
            {tCommon('copyright')}
          </p>
        </div>
      </div>
    </aside>
  );
}
