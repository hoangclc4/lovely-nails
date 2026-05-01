'use client';

import { useTranslations } from 'next-intl';
import { SESSION_STATUS } from '@/constants/session.constants';
import type { SessionStatus } from '@/types/session';

const STATUS_STYLES: Record<SessionStatus, string> = {
  [SESSION_STATUS.IN_PROGRESS]:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [SESSION_STATUS.COMPLETED]:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [SESSION_STATUS.CANCELLED]:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface SessionStatusBadgeProps {
  status: SessionStatus | undefined;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const t = useTranslations('sessionStatus');

  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {t(status)}
    </span>
  );
}
