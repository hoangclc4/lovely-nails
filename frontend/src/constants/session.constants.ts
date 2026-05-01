export const SESSION_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ALL_STATUSES_VALUE = 'all';

export const SESSION_PATHS = {
  ROOT: '/sessions',
  NEW: '/sessions/new',
  DETAIL: (id: string) => `/sessions/${id}`,
} as const;
