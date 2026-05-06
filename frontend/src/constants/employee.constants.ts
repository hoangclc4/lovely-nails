export const EMPLOYEE_ROLE = {
  TECHNICIAN: 'technician',
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
} as const;

export const EMPLOYEE_WORK_STATUS = {
  FREE: 'free',
  BUSY: 'busy',
  ON_BREAK: 'on_break',
  OFF: 'off',
} as const;

export const EMPLOYEE_REVENUE_SHARE_MIN = 0;
export const EMPLOYEE_REVENUE_SHARE_MAX = 100;

export const EMPLOYEE_STATUS_POLL_INTERVAL_MS = 30_000;
