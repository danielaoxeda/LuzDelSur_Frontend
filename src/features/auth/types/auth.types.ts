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
 * Credenciales de inicio de sesión. El backend determina el rol y permisos
 * asociados a la cuenta.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Solicitud de registro público de cuenta.
 */
export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
}
