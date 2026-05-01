export interface SalonSettings {
  salonName: string;
  salonAddress: string | null;
  salonPhone: string | null;
  currency: string;
  timezone: string;
  tipPoolingEnabled: boolean;
  tipPoolPercentage: number;
  defaultBookingBuffer: number;
  autoLogoutMinutes: number;
  receiptFooterText: string | null;
}
