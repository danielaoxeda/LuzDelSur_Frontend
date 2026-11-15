import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../../features/auth/services/auth.service';
import type {
  ActorRole,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../../features/auth/types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<AuthUser>;
  register: (request: RegisterRequest) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = 'lds_user';

function loadInitialUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function getHomeRouteForRole(role: ActorRole): string {
  switch (role) {
    case 'TECNICO':
      return '/tecnico/tareas';
    case 'OPERADOR':
      return '/operador';
    case 'CLIENTE':
      return '/cliente';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadInitialUser());

  const persistSession = useCallback((token: string, authUser: AuthUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('actor_id', authUser.id);
    localStorage.setItem('actor_role', authUser.role);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (request: LoginRequest): Promise<AuthUser> => {
      const response = await authService.login(request);
      persistSession(response.token, response.user);
      return response.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (request: RegisterRequest): Promise<AuthUser> => {
      const response = await authService.register(request);
      persistSession(response.token, response.user);
      return response.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('actor_id');
    localStorage.removeItem('actor_role');
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
