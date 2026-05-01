const NOW = '2026-04-24T00:00:00.000Z'

export const EMPLOYEES_FIXTURE = {
  data: [
    {
      id: '1',
      fullName: 'Nguyen Thi An',
      phone: '0901234567',
      email: 'an@lovelynails.com',
      role: 'technician',
      status: 'active',
      hireDate: '2024-01-01',
      avatarUrl: null,
      revenueSharePct: 60,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: '2',
      fullName: 'Tran Van Binh',
      phone: '0912345678',
      email: null,
      role: 'technician',
      status: 'inactive',
      hireDate: '2024-03-01',
      avatarUrl: null,
      revenueSharePct: 55,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  meta: { page: 1, limit: 20, total: 2 },
}

export const NEW_EMPLOYEE_FIXTURE = {
  id: '3',
  fullName: 'Le Thi Cam',
  phone: '0923456789',
  email: null,
  role: 'technician',
  status: 'active',
  hireDate: '2026-04-24',
  avatarUrl: null,
  revenueSharePct: 50,
  createdAt: NOW,
  updatedAt: NOW,
}
