export const TIP_PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  INCLUDED_IN_BILL: 'included_in_bill',
} as const;

export const TIP_PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Transfer',
  included_in_bill: 'Included in Bill',
};

export const ALL_PAYMENT_METHODS_VALUE = 'all';

export const TIP_PATHS = {
  ROOT: '/tips',
  NEW: '/tips/new',
  DETAIL: (id: string) => `/tips/${id}`,
} as const;
