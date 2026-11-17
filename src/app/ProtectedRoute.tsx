import type { ReactNode } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Zap } from 'lucide-react';
import type { ActorRole } from '../features/auth/types/auth.types';
import { getHomeRouteForRole, useAuth } from '../shared/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ActorRole[];
  children?: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getHomeRouteForRole(user.role)} replace />;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }
  return <>{children}</>;
}

export function RolePlaceholderView({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B132B] text-white">
          <Zap className="h-5 w-5 text-blue-400" />
        </div>
        <h1 className="text-lg font-extrabold text-slate-900">{title}</h1>
        {user && (
          <p className="mt-1 text-xs text-slate-500">
            Sesión activa: <strong>{user.name}</strong> ({user.role})
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Ruta lista para la integración del equipo correspondiente.
        </p>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
