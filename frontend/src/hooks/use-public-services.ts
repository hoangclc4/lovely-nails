import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PublicService } from '@/types/public';
import type { PaginatedResponse } from '@/types/employee';

const PUBLIC_SERVICES_KEY = 'public-services';
const STALE_TIME_MS = 5 * 60 * 1000;

export const publicServiceKeys = {
  all: [PUBLIC_SERVICES_KEY] as const,
};

export function usePublicServices() {
  return useQuery({
    queryKey: publicServiceKeys.all,
    queryFn: () =>
      apiClient.get<PaginatedResponse<PublicService>>('/public/services', {
        params: { isActive: true, limit: 100 },
      }),
    select: (res) => res.data,
    staleTime: STALE_TIME_MS,
  });
}
