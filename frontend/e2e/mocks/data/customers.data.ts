const NOW = '2026-04-24T00:00:00.000Z'

export const CUSTOMERS_FIXTURE = {
  data: [
    {
      id: 'customer-1',
      fullName: 'Nguyen Thi Mai',
      phone: '0901111111',
      email: 'mai@example.com',
      dateOfBirth: null,
      notes: null,
      totalVisits: 5,
      totalSpent: '750000',
      lastVisitDate: '2026-04-20',
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'customer-2',
      fullName: 'Tran Van Nam',
      phone: '0912222222',
      email: null,
      dateOfBirth: null,
      notes: null,
      totalVisits: 2,
      totalSpent: '300000',
      lastVisitDate: '2026-04-22',
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  meta: { page: 1, limit: 20, total: 2 },
}

export const NEW_CUSTOMER_FIXTURE = {
  id: 'customer-3',
  fullName: 'Le Thi Hoa',
  phone: '0923333333',
  email: null,
  dateOfBirth: null,
  notes: null,
  totalVisits: 0,
  totalSpent: '0',
  lastVisitDate: null,
  createdAt: NOW,
  updatedAt: NOW,
}
