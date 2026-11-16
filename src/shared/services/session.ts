/**
 * Almacenamiento de la sesion (JWT). Se aisla aqui para que el cliente HTTP y
 * el contexto de autenticacion compartan las mismas claves sin dependencias
 * circulares.
 */

import type { AuthUser } from '../../features/auth/types/auth.types';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'lds_user';
// Claves de la version con cabeceras X-Actor-*; se limpian al cerrar sesion.
const LEGACY_KEYS = ['actor_id', 'actor_role'];

export const SESSION_EXPIRED_EVENT = 'lds:session-expired';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento la sesion dura solo mientras la pestaña este abierta.
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nada que limpiar.
  }
}

export const session = {
  getToken: () => read(TOKEN_KEY),
  getRefreshToken: () => read(REFRESH_TOKEN_KEY),

  getUser(): AuthUser | null {
    const raw = read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  save(token: string, refreshToken: string | undefined, user: AuthUser): void {
    write(TOKEN_KEY, token);
    if (refreshToken) write(REFRESH_TOKEN_KEY, refreshToken);
    write(USER_KEY, JSON.stringify(user));
    LEGACY_KEYS.forEach(remove);
  },

  saveUser(user: AuthUser): void {
    write(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ...LEGACY_KEYS].forEach(remove);
  },
};
