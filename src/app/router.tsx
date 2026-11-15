import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { TechnicianHistoryPage } from '../features/technician/pages/TechnicianHistoryPage';
import { TechnicianTasksPage } from '../features/technician/pages/TechnicianTasksPage';
import { TechnicianLayout } from '../shared/layouts/TechnicianLayout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RolePlaceholderView,
  RootRedirect,
} from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/tecnico',
    element: (
      <ProtectedRoute allowedRoles={['TECNICO']}>
        <TechnicianLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/tecnico/tareas" replace />,
      },
      {
        path: 'tareas',
        element: <TechnicianTasksPage />,
      },
      {
        path: 'historial',
        element: <TechnicianHistoryPage />,
      },
    ],
  },
  {
    path: '/cliente',
    element: (
      <ProtectedRoute allowedRoles={['CLIENTE']}>
        <RolePlaceholderView title="Módulo de Cliente" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/operador',
    element: (
      <ProtectedRoute allowedRoles={['OPERADOR']}>
        <RolePlaceholderView title="Módulo de Operador" />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
