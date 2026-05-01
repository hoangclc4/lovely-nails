const NOW = '2026-04-24T00:00:00.000Z'

export const BOOKINGS_FIXTURE = {
  data: [
    {
      id: 'booking-1',
      customerId: 'customer-1',
      employeeId: 'employee-1',
      serviceIds: ['service-1'],
      bookingDate: '2026-04-24',
      startTime: '10:00:00',
      endTime: '11:00:00',
      status: 'pending',
      notes: null,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: 'booking-2',
      customerId: 'customer-2',
      employeeId: 'employee-2',
      serviceIds: ['service-1'],
      bookingDate: '2026-04-24',
      startTime: '14:00:00',
      endTime: '15:00:00',
      status: 'confirmed',
      notes: 'Walk-in customer',
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  meta: { page: 1, limit: 20, total: 2 },
}

export const AVAILABLE_EMPLOYEES_FIXTURE = [
  { id: 'employee-1', fullName: 'Nguyen Thi An', workStatus: 'free' },
  { id: 'employee-2', fullName: 'Tran Van Binh', workStatus: 'free' },
]

export const NEW_BOOKING_FIXTURE = {
  id: 'booking-3',
  customerId: 'customer-1',
  employeeId: 'employee-1',
  serviceIds: ['service-1'],
  bookingDate: '2026-04-25',
  startTime: '10:00:00',
  endTime: '11:00:00',
  status: 'pending',
  notes: null,
  createdAt: NOW,
  updatedAt: NOW,
}
