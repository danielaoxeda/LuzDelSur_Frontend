import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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
