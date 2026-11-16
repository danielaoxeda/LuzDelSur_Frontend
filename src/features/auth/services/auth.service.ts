import { api } from '../../../shared/services/api';
import type {
  ActorRole,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types';

const USE_MOCK = true;

const MOCK_PROFILES: Record<ActorRole, { id: string; name: string }> = {
  TECNICO: {
    id: 'tecnico-1',
    name: 'Cuadrilla T-08 (C. Huamán)',
  },
  OPERADOR: {
    id: 'operador-1',
    name: 'Mesa de Control Central',
  },
  CLIENTE: {
    id: 'cliente-demo',
    name: 'Carlos Mendoza Ríos',
  },
};

export const authService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const preset = MOCK_PROFILES[request.role];
      const cleanUser = request.username.trim();
      return {
        token: `mock-jwt-token-${request.role.toLowerCase()}`,
        user: {
          id: cleanUser || preset.id,
          name: preset.name,
          role: request.role,
        },
      };
    }

    const { data } = await api.post<AuthResponse>('/v1/auth/login', request);
    return data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        token: `mock-jwt-token-${request.role.toLowerCase()}`,
        user: {
          id: request.username.trim(),
          name: request.name.trim(),
          role: request.role,
        },
      };
    }

    const { data } = await api.post<AuthResponse>('/v1/auth/register', request);
    return data;
  },
};
