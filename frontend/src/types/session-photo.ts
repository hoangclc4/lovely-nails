export interface SessionPhoto {
  id: string;
  sessionId: string;
  employeeId: string;
  customerId: string | null;
  photoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  isPortfolio: boolean;
  createdAt: string;
}
