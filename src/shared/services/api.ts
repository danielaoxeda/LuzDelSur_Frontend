import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const actorId = localStorage.getItem('actor_id');
  const actorRole = localStorage.getItem('actor_role');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (actorId) {
    config.headers['X-Actor-Id'] = actorId;
  }
  if (actorRole) {
    config.headers['X-Actor-Role'] = actorRole;
  }

  return config;
});

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error al procesar la solicitud.'
): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
