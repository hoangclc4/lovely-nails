export const SERVICE_PATHS = {
  LIST: '/services',
  NEW: '/services/new',
  DETAIL: (id: string) => `/services/${id}`,
} as const;

export const SERVICE_CATEGORY_PATHS = {
  LIST: '/service-categories',
  NEW: '/service-categories/new',
  DETAIL: (id: string) => `/service-categories/${id}`,
} as const;

export const ALL_CATEGORIES_VALUE = 'all' as const;
