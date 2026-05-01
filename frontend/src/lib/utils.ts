import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GUAM_TIMEZONE = 'Pacific/Guam';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('en-US', { timeZone: GUAM_TIMEZONE });
}
