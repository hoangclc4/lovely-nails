import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateSessionDto,
  AddSessionServiceDto,
  AddSessionAddOnDto,
  AddTimeExtensionDto,
} from '@/schemas/session.schema';
import type {
  Session,
  SessionSummary,
  SessionTimeExtension,
  SessionListParams,
  PaginatedResponse,
} from '@/types/session';
import { apiClient } from '@/lib/api-client';

const SESSIONS_KEY = 'sessions';

export const sessionKeys = {
  all: [SESSIONS_KEY] as const,
  list: (params?: SessionListParams) => [SESSIONS_KEY, params] as const,
  detail: (id: string) => [SESSIONS_KEY, id] as const,
  extensions: (id: string) => [SESSIONS_KEY, id, 'extensions'] as const,
  nextNumber: (date: string) => [SESSIONS_KEY, 'next-number', date] as const,
};

export function useSessions(params?: SessionListParams) {
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<SessionSummary>>('/sessions', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Session }>(`/sessions/${id}`)
        .then((res) => res.data),
    enabled: id.length > 0,
  });
}

export function useCreateSession() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionDto) =>
      apiClient
        .post<{ success: boolean; data: Session }>('/sessions', data)
        .then((res) => res.data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useCompleteSession(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.patch<SessionSummary>(`/sessions/${id}/complete`, {}),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useCancelSession(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.patch<SessionSummary>(`/sessions/${id}/cancel`, {}),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useAddSessionService(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: AddSessionServiceDto) =>
      apiClient.post(`/sessions/${id}/services`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionKeys.detail(id) });
    },
  });
}

export function useAddSessionAddOn(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: AddSessionAddOnDto) =>
      apiClient.post(`/sessions/${id}/add-ons`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionKeys.detail(id) });
    },
  });
}

export function useExtendSessionTime(id: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: AddTimeExtensionDto) =>
      apiClient.post(`/sessions/${id}/extend-time`, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: sessionKeys.detail(id) });
    },
  });
}

export function useSessionExtensions(id: string) {
  return useQuery({
    queryKey: sessionKeys.extensions(id),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<SessionTimeExtension>>(`/sessions/${id}/extensions`)
        .then((res) => res.data),
    enabled: id.length > 0,
  });
}

export function useNextSessionNumber(date: string) {
  return useQuery({
    queryKey: sessionKeys.nextNumber(date),
    queryFn: async (): Promise<string> => {
      const res = await apiClient.get<unknown>('/sessions/next-number', { params: { date } });
      if (
        typeof res === 'object' &&
        res !== null &&
        'data' in res &&
        typeof (res as { data: unknown }).data === 'string'
      ) {
        return (res as { data: string }).data;
      }
      return res as string;
    },
    enabled: date.length > 0,
  });
}
