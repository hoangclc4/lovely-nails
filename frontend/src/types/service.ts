import type { PaginatedResponse } from './employee';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface ServiceListParams {
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ServiceCategoryListParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ServiceAddOnListParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export type { PaginatedResponse };
