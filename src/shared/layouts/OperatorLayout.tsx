import { Inbox } from 'lucide-react';
import { PortalLayout, type PortalNavItem } from './PortalLayout';

const OPERATOR_NAV: PortalNavItem[] = [
  { to: '/operador/bandeja', label: 'Bandeja de Gestión', icon: Inbox },
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
