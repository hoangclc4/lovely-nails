export const SESSION_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SESSION_ERROR = {
  NOT_FOUND: 'Session not found',
  ALREADY_COMPLETED: 'Session is already completed',
  ALREADY_CANCELLED: 'Session is already cancelled',
  NOT_IN_PROGRESS: 'Session is not in progress',
} as const;
