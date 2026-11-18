import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CustomerNewReportPage } from '../features/customer/pages/CustomerNewReportPage';
import { CustomerReportsPage } from '../features/customer/pages/CustomerReportsPage';
import { CustomerTrackingPage } from '../features/customer/pages/CustomerTrackingPage';
import { OperatorAssignmentsPage } from '../features/operator/pages/OperatorAssignmentsPage';
import { OperatorDashboardPage } from '../features/operator/pages/OperatorDashboardPage';
import { OperatorIncidentDetailPage } from '../features/operator/pages/OperatorIncidentDetailPage';
import { OperatorInboxPage } from '../features/operator/pages/OperatorInboxPage';
import { OperatorReportsHistoryPage } from '../features/operator/pages/OperatorReportsHistoryPage';
import { OperatorTechniciansPage } from '../features/operator/pages/OperatorTechniciansPage';
import { TechnicianHistoryPage } from '../features/technician/pages/TechnicianHistoryPage';
import { TechnicianTasksPage } from '../features/technician/pages/TechnicianTasksPage';
import { CustomerLayout } from '../shared/layouts/CustomerLayout';
import { OperatorLayout } from '../shared/layouts/OperatorLayout';
import { TechnicianLayout } from '../shared/layouts/TechnicianLayout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
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
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/cliente/nueva" replace />,
      },
      {
        path: 'nueva',
        element: <CustomerNewReportPage />,
      },
      {
        path: 'reportes',
        element: <CustomerReportsPage />,
      },
      {
        path: 'reportes/:reportId',
        element: <CustomerTrackingPage />,
      },
    ],
  },
  {
    path: '/operador',
    element: (
      <ProtectedRoute allowedRoles={['OPERADOR']}>
        <OperatorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/operador/panel" replace />,
      },
      {
        path: 'panel',
        element: <OperatorDashboardPage />,
      },
      {
        path: 'bandeja',
        element: <OperatorInboxPage />,
      },
      {
        path: 'asignacion',
        element: <OperatorAssignmentsPage />,
      },
      {
        path: 'tecnicos',
        element: <OperatorTechniciansPage />,
      },
      {
        path: 'reportes',
        element: <OperatorReportsHistoryPage />,
      },
      {
        path: 'incidencias/:incidentId',
        element: <OperatorIncidentDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
