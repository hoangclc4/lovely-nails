const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100/api/v1';

const ACCESS_TOKEN_KEY = 'ln_access_token';
const REFRESH_TOKEN_KEY = 'ln_refresh_token';

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function handleUnauthorized(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = 'ln_auth=; path=/; max-age=0';
  window.location.href = '/login';
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (!params) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const message = await parseErrorMessage(response);
  throw new Error(message);
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = buildUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    const url = buildUrl(path);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<T> {
    const url = buildUrl(path);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<T>(response);
  },
};
