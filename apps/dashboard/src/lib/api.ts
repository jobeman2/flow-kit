const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flowkit_token') || localStorage.getItem('onboardflow_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flowkit_refresh_token') || localStorage.getItem('onboardflow_refresh_token');
}

export function getActiveProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flowkit_active_project') || localStorage.getItem('onboardflow_active_project');
}

export function setActiveProjectId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('flowkit_active_project', id);
  localStorage.setItem('onboardflow_active_project', id);
}

export function setAuthTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('flowkit_token', accessToken);
  localStorage.setItem('onboardflow_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('flowkit_refresh_token', refreshToken);
    localStorage.setItem('onboardflow_refresh_token', refreshToken);
  }
}

export function setAuthToken(token: string) {
  setAuthTokens(token);
}

export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('flowkit_token');
  localStorage.removeItem('flowkit_refresh_token');
  localStorage.removeItem('flowkit_active_project');
  localStorage.removeItem('onboardflow_token');
  localStorage.removeItem('onboardflow_refresh_token');
  localStorage.removeItem('onboardflow_active_project');
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiry & Automatic Refresh Rotation
  if (res.status === 401 && !endpoint.includes('/v1/auth/')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_URL}/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAuthTokens(data.accessToken, data.refreshToken);
            refreshQueue.forEach((cb) => cb(data.accessToken));
            refreshQueue = [];
            isRefreshing = false;

            // Retry original request with fresh access token
            headers.set('Authorization', `Bearer ${data.accessToken}`);
            res = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
            });
          } else {
            throw new Error('Refresh failed');
          }
        } catch {
          isRefreshing = false;
          refreshQueue = [];
          removeAuthToken();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        // Wait in queue for token refresh
        await new Promise<void>((resolve) => {
          refreshQueue.push((newToken) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            resolve();
          });
        });
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    } else {
      removeAuthToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    let message = `API request failed with status ${res.status}`;
    let errorPayload: any = null;
    try {
      errorPayload = JSON.parse(errText);
      message = errorPayload.message || message;
    } catch {}
    const error = new Error(message) as any;
    error.status = res.status;
    error.data = errorPayload;
    throw error;
  }

  return res.json();
}
