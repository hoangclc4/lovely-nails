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
