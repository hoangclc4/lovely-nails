import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTipDto, UpdateTipDto } from '@/schemas/tip.schema';
import type {
  Tip,
  TipListParams,
  TipSummaryParams,
  TipSummary,
  PaginatedTipsResponse,
} from '@/types/tip';
import { apiClient } from '@/lib/api-client';

const TIPS_KEY = 'tips';

export const tipKeys = {
  all: [TIPS_KEY] as const,
  list: (params?: TipListParams) => [TIPS_KEY, params] as const,
  detail: (id: string) => [TIPS_KEY, id] as const,
  summary: (params?: TipSummaryParams) => [TIPS_KEY, 'summary', params] as const,
};

export function useTips(params?: TipListParams) {
  return useQuery({
    queryKey: tipKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedTipsResponse>('/tips', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useTip(id: string) {
  return useQuery({
    queryKey: tipKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Tip }>(`/tips/${id}`),
    enabled: id.length > 0,
  });
}

export function useTipSummary(params?: TipSummaryParams) {
  return useQuery({
    queryKey: tipKeys.summary(params),
    queryFn: () =>
      apiClient.get<{ data: TipSummary }>('/tips/summary', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useCreateTip() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTipDto) => apiClient.post<Tip>('/tips', data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: tipKeys.all });
    },
  });
}

export function useUpdateTip(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTipDto) => apiClient.patch<Tip>(`/tips/${id}`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: tipKeys.all });
    },
  });
}

export function useDeleteTip() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<Tip>(`/tips/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: tipKeys.all });
    },
  });
}
