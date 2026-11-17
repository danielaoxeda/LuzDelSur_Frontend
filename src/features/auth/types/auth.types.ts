export type ActorRole = 'CLIENTE' | 'OPERADOR' | 'TECNICO';

/**
 * Corresponde a AuthDtos.AuthUser. `id` es el UUID de la cuenta (sub del JWT).
 */
export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  role: ActorRole;
}

/**
 * Corresponde a AuthDtos.AuthResponse.
 */
export interface AuthResponse {
  token: string;
  tokenType?: string;
  expiresIn?: number;
  expiresAt?: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
  user: AuthUser;
}

/**
 * `role` es opcional en el backend: si se envia y no coincide con la cuenta,
 * el login responde 403 con un mensaje claro.
 */
export interface LoginRequest {
  username: string;
  password: string;
  role?: ActorRole;
}

/**
 * El registro publico crea cuentas CLIENTE. Las de operador y tecnico las crea
 * un operador (o la semilla de demo).
 */
export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  role?: ActorRole;
}
