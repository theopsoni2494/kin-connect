import { API_BASE_URL } from "./brand";
import { getAccessToken, getRefreshToken, setTokens, clearSession } from "./session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        setTokens(data.accessToken);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isForm?: boolean;
  _retried?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!opts.isForm) headers["content-type"] = "application/json";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : opts.isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
  });

  if (res.status === 401 && !opts._retried) {
    const newToken = await refreshAccessToken();
    if (newToken) return request<T>(path, { ...opts, _retried: true });
    clearSession();
    throw new ApiError(401, "session expired");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, data.error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body });
export const apiPatch = <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body });
export const apiDelete = <T>(path: string) => request<T>(path, { method: "DELETE" });
export const apiUpload = <T>(path: string, form: FormData) =>
  request<T>(path, { method: "POST", body: form, isForm: true });
