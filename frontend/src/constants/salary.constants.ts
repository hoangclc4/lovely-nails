export const SALARY_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PAID: 'paid',
} as const;

export const SALARY_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  paid: 'Paid',
};

export const ADJUSTMENT_TYPE = {
  BONUS: 'bonus',
  DEDUCTION: 'deduction',
  ADVANCE: 'advance',
  PENALTY: 'penalty',
  OTHER: 'other',
} as const;

export const ADJUSTMENT_TYPE_LABEL: Record<string, string> = {
  bonus: 'Bonus',
  deduction: 'Deduction',
  advance: 'Advance',
  penalty: 'Penalty',
  other: 'Other',
};

export const ALL_STATUSES_VALUE = 'all' as const;

export const SALARY_PATHS = {
  LIST: '/salaries',
  DETAIL: (id: string) => `/salaries/${id}`,
} as const;
