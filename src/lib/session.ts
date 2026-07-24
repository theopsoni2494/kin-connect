import type { Session } from "./types";

const SESSION_KEY = "kc_session_v1";
const ACCESS_TOKEN_KEY = "kc_access_token_v1";
const REFRESH_TOKEN_KEY = "kc_refresh_token_v1";

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribeSession(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function emit() {
  listeners.forEach((l) => l());
}

let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return null;
  }
  try {
    cachedSession = JSON.parse(raw) as Session;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function setSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
  emit();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  emit();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  emit();
}
