import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const ACCESS = "facilita.access";
const REFRESH = "facilita.refresh";

export class ApiError extends Error {
  status: number;
  type?: string;
  constructor(message: string, status: number, type?: string) {
    super(message);
    this.status = status;
    this.type = type;
  }
}

export function apiBase() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${host ?? "localhost"}:3001/api`;
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH);
  if (!refreshToken) return false;
  const response = await fetch(`${apiBase()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
    return false;
  }
  const data = await response.json();
  await SecureStore.setItemAsync(ACCESS, data.accessToken);
  await SecureStore.setItemAsync(REFRESH, data.refreshToken);
  return true;
}

export async function saveSession(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS, accessToken);
  await SecureStore.setItemAsync(REFRESH, refreshToken);
}

export async function logout() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH);
  if (refreshToken) {
    await api("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }).catch(() => undefined);
  }
  await clearSession();
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}

export async function hasSession() {
  return Boolean(await SecureStore.getItemAsync(ACCESS));
}

export async function api<T>(path: string, options: RequestInit & { auth?: boolean } = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (options.auth !== false) {
    const token = await SecureStore.getItemAsync(ACCESS);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${apiBase()}${path}`, { ...options, headers });
  if (response.status === 401 && retry && options.auth !== false) {
    refreshing ??= refreshTokens().finally(() => {
      refreshing = null;
    });
    if (await refreshing) return api<T>(path, options, false);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error ?? "Não foi possível concluir", response.status, data.type);
  return data as T;
}
