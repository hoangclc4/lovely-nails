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
  OFF: 'off',
  ON_BREAK: 'on_break',
} as const;

export const EMPLOYEE_REVENUE_SHARE_MIN = 0;
export const EMPLOYEE_REVENUE_SHARE_MAX = 100;
