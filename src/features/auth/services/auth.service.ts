import { api } from '../../../shared/services/api';
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types';

/**
 * AuthController del backend (JWT). Sin mocks: un error de credenciales o de
 * conexion se muestra tal cual en el formulario.
 */
export const authService = {
  /** POST /api/v1/auth/login */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/v1/auth/login', request);
    return data;
  },

  /** POST /api/v1/auth/register */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/v1/auth/register', request);
    return data;
  },

  /** GET /api/v1/auth/me */
  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/v1/auth/me');
    return data;
  },
};
