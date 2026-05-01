export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
}

export interface PublicEmployee {
  id: string;
  fullName: string;
}

export interface PublicBookingRequest {
  customerName: string;
  customerPhone: string;
  serviceIds: string[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  employeeId?: string;
  notes?: string;
}

export interface PublicBookingResponse {
  bookingNumber: string;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
}
