import {
  ArrowRightLeft,
  History,
  Inbox,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { PortalLayout, type PortalNavItem } from './PortalLayout';

const OPERATOR_NAV: PortalNavItem[] = [
  { to: '/operador/panel', label: 'Panel de Monitoreo', icon: LayoutDashboard },
  { to: '/operador/bandeja', label: 'Bandeja de Gestión', icon: Inbox },
  {
    to: '/operador/asignacion',
    label: 'Asignación de Reportes',
    icon: ArrowRightLeft,
  },
  { to: '/operador/tecnicos', label: 'Gestión de Técnicos', icon: Users },
  { to: '/operador/reportes', label: 'Historial de Reportes', icon: History },
];

export function OperatorLayout() {
  return (
    <PortalLayout
      portalTitle="Mesa de Control"
      portalSubtitle="Operador de Incidencias"
      navAriaLabel="Navegación del operador"
      navItems={OPERATOR_NAV}
    />
  );
}
