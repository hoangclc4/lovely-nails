'use client';

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
  X,
  UserRound,
  Settings,
  LogOut,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const { isOpen, close } = useSidebar();
  const { logout } = useLogout();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col',
        'bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))]',
        'transition-transform duration-300 ease-in-out',
        'md:static md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
          <span
            className="text-lg font-semibold text-[hsl(var(--primary))]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Lovely Nails
          </span>
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
                'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tNav(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="border-t border-[hsl(var(--sidebar-border))] pt-3 space-y-0.5">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full rounded-full px-4 py-2.5 text-sm font-medium text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {tCommon('signOut')}
          </button>
          <p className="px-4 text-xs text-[hsl(var(--muted-foreground))]">
            {tCommon('copyright')}
          </p>
        </div>
      </div>
    </aside>
  );
}
