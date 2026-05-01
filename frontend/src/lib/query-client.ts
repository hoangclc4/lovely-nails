import { QueryClient } from '@tanstack/react-query';

const STALE_TIME = 1000 * 60;
const RETRY_COUNT = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      retry: RETRY_COUNT,
    },
  },
});
