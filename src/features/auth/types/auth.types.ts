export type ActorRole = 'CLIENTE' | 'OPERADOR' | 'TECNICO';

export interface AuthUser {
  id: string;
  name: string;
  role: ActorRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  username: string;
  password: string;
  role: ActorRole;
}

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  role: ActorRole;
}
