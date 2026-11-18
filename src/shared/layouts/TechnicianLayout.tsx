import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  History,
  LogOut,
  Menu,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function TechnicianLayout() {
  const { user, logout } = useAuth();
  const { info } = useNotification();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
    info('Sesión cerrada', 'Ha salido del sistema correctamente.');
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-[#0B132B] text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Overlay móvil para cerrar el menú hamburguesa */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Barra lateral izquierda (Fija en desktop, Drawer hamburguesa en móvil/tablet) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-5 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Cuadrilla Técnica
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Técnico de Campo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5" aria-label="Navegación del técnico">
            <NavLink
              to="/tecnico/tareas"
              onClick={() => setSidebarOpen(false)}
              className={navLinkClass}
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>Tareas Asignadas</span>
            </NavLink>

            <NavLink
              to="/tecnico/historial"
              onClick={() => setSidebarOpen(false)}
              className={navLinkClass}
            >
              <History className="h-4 w-4 shrink-0" />
              <span>Historial de Tareas</span>
            </NavLink>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Columna principal (Cabecera superior + Contenido) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú de navegación"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B132B] text-white">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                LUZ DEL SUR
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <span className="hidden text-xs font-semibold text-slate-700 sm:inline">
                {user.name}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B132B] text-white">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
