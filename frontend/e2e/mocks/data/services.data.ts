const NOW = '2026-04-24T00:00:00.000Z'

export const SERVICES_FIXTURE = {
  data: [
    {
      id: 'service-1',
      categoryId: null,
      name: 'Basic Manicure',
      description: 'Classic nail care and polish',
      price: '150000',
      durationMinutes: 45,
      isActive: true,
      imageUrl: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'service-2',
      categoryId: null,
      name: 'Gel Polish',
      description: null,
      price: '200000',
      durationMinutes: 60,
      isActive: false,
      imageUrl: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  meta: { page: 1, limit: 20, total: 2 },
}

export const SERVICE_CATEGORIES_FIXTURE = {
  data: [
    { id: 'cat-1', name: 'Manicure', description: null, sortOrder: 1, isActive: true },
    { id: 'cat-2', name: 'Pedicure', description: null, sortOrder: 2, isActive: true },
  ],
  meta: { page: 1, limit: 100, total: 2 },
}

export const NEW_SERVICE_FIXTURE = {
  id: 'service-3',
  categoryId: null,
  name: 'Foot Massage',
  description: null,
  price: '100000',
  durationMinutes: 30,
  isActive: true,
  imageUrl: null,
  createdAt: NOW,
  updatedAt: NOW,
}
