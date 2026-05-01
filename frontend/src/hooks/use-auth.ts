import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { setStoredTokens, clearStoredTokens } from '@/stores/auth.store';
import type { AuthTokens } from '@/types/auth';
import type { LoginInput } from '@/schemas/auth.schema';

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: LoginInput) =>
      apiClient.post<{ data: AuthTokens }>('/auth/login', dto),
    onSuccess: (response) => {
      setStoredTokens(response.data.accessToken, response.data.refreshToken);
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return {
    logout: () => {
      clearStoredTokens();
      router.push('/login');
    },
  };
}
