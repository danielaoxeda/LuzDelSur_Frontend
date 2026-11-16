import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '../../features/auth/types/auth.types';
import { SESSION_EXPIRED_EVENT, session } from './session';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * La identidad viaja solo en el JWT. El backend ignora X-Actor-* en despliegue,
 * por eso ya no se envian.
 */
api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Renueva el token una sola vez aunque varias peticiones fallen a la vez.
 * Usa axios directo (no `api`) para no entrar en bucle con este interceptor.
 */
function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = session.getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);

  refreshInFlight = axios
    .post<AuthResponse>(`${baseURL}/v1/auth/refresh`, { refreshToken })
    .then(({ data }) => {
      session.save(data.token, data.refreshToken, data.user);
      return data.token;
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

function expireSession(): void {
  session.clear();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    // Login, registro y refresco responden 401 por credenciales: no se reintentan.
    const isAuthEndpoint = /\/v1\/auth\/(login|register|refresh)/.test(config?.url ?? '');

    if (status !== 401 || !config || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (config._retried || !session.getToken()) {
      if (session.getToken()) expireSession();
      return Promise.reject(error);
    }

    const newToken = await refreshAccessToken();
    if (!newToken) {
      expireSession();
      return Promise.reject(error);
    }

    config._retried = true;
    config.headers.Authorization = `Bearer ${newToken}`;
    return api(config);
  }
);

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error al procesar la solicitud.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: string[] } | undefined;
    if (data?.message) {
      const details = data.details?.filter(Boolean) ?? [];
      return details.length > 0 ? `${data.message}: ${details.join('; ')}` : data.message;
    }
    if (!error.response) {
      return 'No hay conexión con el servidor. Verifique que el backend esté en ejecución.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
