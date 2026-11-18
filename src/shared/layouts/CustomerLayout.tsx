import { FilePlus2, FolderOpen, LayoutDashboard } from 'lucide-react';
import { PortalLayout, type PortalNavItem } from './PortalLayout';

const CUSTOMER_NAV: PortalNavItem[] = [
  { to: '/cliente/panel', label: 'Panel Principal', icon: LayoutDashboard },
  { to: '/cliente/nueva', label: 'Reportar Incidencia', icon: FilePlus2 },
  { to: '/cliente/reportes', label: 'Historial de Reportes', icon: FolderOpen },
];

export function CustomerLayout() {
  return (
    <PortalLayout
      portalTitle="Portal del Cliente"
      portalSubtitle="Usuario Residencial"
      navAriaLabel="Navegación del cliente"
      navItems={CUSTOMER_NAV}
    />
  );
}
