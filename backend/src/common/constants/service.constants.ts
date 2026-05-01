export const SERVICE_SORT_ORDER_DEFAULT = 0;

export const SERVICE_CATEGORY_ERROR = {
  NOT_FOUND: 'Service category not found',
} as const;

export const SERVICE_ERROR = {
  NOT_FOUND: 'Service not found',
  IN_USE: 'Service cannot be deleted because it is linked to existing session records',
} as const;

export const SERVICE_ADD_ON_ERROR = {
  NOT_FOUND: 'Service add-on not found',
} as const;
