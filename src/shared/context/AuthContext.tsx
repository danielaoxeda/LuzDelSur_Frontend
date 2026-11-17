import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isAxiosError } from 'axios';
import { authService } from '../../features/auth/services/auth.service';
import type {
  ActorRole,
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../../features/auth/types/auth.types';
import { SESSION_EXPIRED_EVENT, session } from '../services/session';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<AuthUser>;
  register: (request: RegisterRequest) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitialUser(): AuthUser | null {
  // Sin token no hay sesion valida, aunque quede un usuario guardado.
  return session.getToken() ? session.getUser() : null;
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

  const persistSession = useCallback((response: AuthResponse) => {
    session.save(response.token, response.refreshToken, response.user);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (request: LoginRequest): Promise<AuthUser> => {
      const response = await authService.login(request);
      persistSession(response);
      return response.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (request: RegisterRequest): Promise<AuthUser> => {
      const response = await authService.register(request);
      persistSession(response);
      return response.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  // El interceptor de Axios avisa cuando el token vencio y no se pudo renovar.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // Al recargar la pagina se valida la sesion guardada contra GET /auth/me.
  useEffect(() => {
    if (!session.getToken()) return;
    let active = true;
    authService
      .me()
      .then((current) => {
        if (!active) return;
        session.saveUser(current);
        setUser(current);
      })
      .catch((err) => {
        // Un 401 ya fue tratado por el interceptor (refresco o cierre de sesion).
        // 403/404: cuenta desactivada o inexistente (por ejemplo, base reiniciada).
        // Un error de red no cierra la sesion: el backend puede estar reiniciando.
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (active && (status === 403 || status === 404)) {
          session.clear();
          setUser(null);
        }
      });
    return () => {
      active = false;
    };
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
