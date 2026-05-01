export const SALARY_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PAID: 'paid',
} as const;

export const ADJUSTMENT_TYPE = {
  BONUS: 'bonus',
  DEDUCTION: 'deduction',
  ADVANCE: 'advance',
  PENALTY: 'penalty',
  OTHER: 'other',
} as const;

export const SALARY_ERROR = {
  NOT_FOUND: 'Salary record not found',
  ALREADY_CONFIRMED: 'Salary record is already confirmed',
  ALREADY_PAID: 'Salary record is already paid',
  CANNOT_MODIFY_CONFIRMED: 'Cannot modify a confirmed salary record',
  EMPLOYEE_SALARY_EXISTS: 'Salary record already exists for this employee in this period',
} as const;
