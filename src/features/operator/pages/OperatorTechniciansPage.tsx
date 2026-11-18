import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Loader2,
  Power,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { ActionModal } from '../../../shared/components/ActionModal';
import { formatDateTime } from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { TechnicianFormModal } from '../components/TechnicianFormModal';
import { operatorService } from '../services/operator.service';
import type {
  TechnicianCreateRequest,
  TechnicianOption,
} from '../types/operator.types';

interface ToggleTarget {
  technician: TechnicianOption;
  nextActive: boolean;
}

export function OperatorTechniciansPage() {
  const { success, error: notifyError } = useNotification();

  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(false);
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<ToggleTarget | null>(null);

  const refresh = () => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    operatorService
      .getTechnicians(onlyActive)
      .then((list) => {
        if (!active) return;
        setTechnicians(list);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          extractApiErrorMessage(err, 'No se pudo cargar la lista de técnicos.')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onlyActive, reloadKey]);

  const handleCreate = async (request: TechnicianCreateRequest) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const created = await operatorService.createTechnician(request);
      setCreateOpen(false);
      success(
        'Técnico registrado',
        `${created.name} fue creado con el usuario ${created.username}.`
      );
      refresh();
    } catch (err) {
      notifyError('No se pudo crear el técnico', extractApiErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleTarget || actionBusy) return;
    setActionBusy(true);
    try {
      const updated = await operatorService.updateTechnician(
        toggleTarget.technician.id,
        { active: toggleTarget.nextActive }
      );
      setTechnicians((current) =>
        onlyActive && !updated.active
          ? current.filter((item) => item.id !== updated.id)
          : current.map((item) => (item.id === updated.id ? updated : item))
      );
      setToggleTarget(null);
      success(
        updated.active ? 'Técnico activado' : 'Técnico desactivado',
        updated.active
          ? `${updated.name} puede volver a iniciar sesión.`
          : `${updated.name} ya no podrá iniciar sesión ni recibir nuevos casos.`
      );
    } catch (err) {
      notifyError(
        'No se pudo actualizar el técnico',
        extractApiErrorMessage(err)
      );
    } finally {
      setActionBusy(false);
    }
  };

  const cleanSearch = search.trim().toLowerCase();
  const filtered = technicians.filter((technician) => {
    if (!cleanSearch) return true;
    return (
      technician.name.toLowerCase().includes(cleanSearch) ||
      technician.username.toLowerCase().includes(cleanSearch)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Gestión de Técnicos
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Directorio de cuentas con rol TECNICO y su carga de casos abiertos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Nuevo técnico</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-[11px] leading-relaxed text-blue-900">
        El backend permite consultar, crear y activar/desactivar cuentas de
        técnico. Desactivar una cuenta sustituye al borrado: el técnico
        conserva su historial pero no puede iniciar sesión ni recibir nuevas
        asignaciones.
      </div>

      {loadError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-semibold leading-relaxed text-amber-900">
            {loadError}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Técnicos</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {filtered.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(event) => {
                  setLoading(true);
                  setOnlyActive(event.target.checked);
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Solo activos
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o usuario"
                className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Consultando el directorio de técnicos...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {technicians.length === 0
                ? 'No hay técnicos registrados con este criterio.'
                : 'Ningún técnico coincide con la búsqueda.'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Cree una cuenta de técnico para poder asignarle casos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Técnico</th>
                  <th className="px-6 py-3.5">Usuario</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-center">Casos abiertos</th>
                  <th className="px-6 py-3.5">Último acceso</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {filtered.map((technician) => (
                  <tr
                    key={technician.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {technician.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                        {technician.id}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      {technician.username}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-bold ${
                          technician.active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {technician.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
                        {technician.openAssignments}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                      {formatDateTime(technician.lastLoginAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() =>
                          setToggleTarget({
                            technician,
                            nextActive: !technician.active,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                          technician.active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        <span>
                          {technician.active ? 'Desactivar' : 'Activar'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <TechnicianFormModal
          isSubmitting={actionBusy}
          onCancel={() => {
            if (!actionBusy) setCreateOpen(false);
          }}
          onConfirm={(request) => void handleCreate(request)}
        />
      )}

      <ActionModal
        open={Boolean(toggleTarget)}
        title={
          toggleTarget?.nextActive ? 'Activar técnico' : 'Desactivar técnico'
        }
        description={
          toggleTarget
            ? toggleTarget.nextActive
              ? `${toggleTarget.technician.name} podrá volver a iniciar sesión y recibir casos asignados.`
              : `${toggleTarget.technician.name} no podrá iniciar sesión ni recibir nuevas asignaciones. Los casos ya asignados conservan su historial.`
            : undefined
        }
        confirmLabel={toggleTarget?.nextActive ? 'Activar' : 'Desactivar'}
        tone={toggleTarget?.nextActive ? 'primary' : 'danger'}
        isSubmitting={actionBusy}
        onCancel={() => {
          if (!actionBusy) setToggleTarget(null);
        }}
        onConfirm={() => void handleToggleActive()}
      />
    </div>
  );
}
