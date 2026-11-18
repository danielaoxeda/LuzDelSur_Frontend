import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  FolderOpen,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import type { IncidentStatus } from '../../../shared/types/domain.types';
import { TrackByCodeForm } from '../components/TrackByCodeForm';
import { useMyReports } from '../hooks/useMyReports';

function countByStatus(
  statuses: (IncidentStatus | null | undefined)[],
  target: IncidentStatus[]
): number {
  return statuses.filter(
    (status): status is IncidentStatus =>
      status !== null && status !== undefined && target.includes(status)
  ).length;
}

export function CustomerDashboardPage() {
  const { items, loading, pageData, reload } = useMyReports();

  const stats = useMemo(() => {
    const statuses = items.map((item) => item.tracking?.incidentStatus);
    return {
      total: pageData?.totalElements ?? items.length,
      revision: countByStatus(statuses, ['SUGERIDA']),
      enCurso: countByStatus(statuses, ['CONFIRMADA', 'EN_ATENCION']),
      cerradas: countByStatus(statuses, ['RESUELTA', 'CERRADA']),
      noDisponibles: items.filter((item) => !item.tracking).length,
    };
  }, [items, pageData]);

  const recent = items.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
              Panel del Cliente
            </h1>
            <p className="text-xs text-slate-500">
              Seguimiento de las incidencias registradas con tu cuenta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <Link
              to="/cliente/nueva"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              <span>Nueva incidencia</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <FolderOpen className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Reportes
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                En revisión
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.revision}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                En curso
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.enCurso}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Resueltas / cerradas
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.cerradas}
            </p>
          </div>
        </div>

        {stats.noDisponibles > 0 && (
          <div className="mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 sm:mx-6 sm:mb-6">
            {stats.noDisponibles} reporte(s) no pudieron actualizarse en este
            momento. El estado mostrado se limita a la última consulta exitosa.
          </div>
        )}
      </div>

      <TrackByCodeForm />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-extrabold text-slate-900">
            Actividad reciente
          </h2>
          <Link
            to="/cliente/reportes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Consultando el estado de sus reportes...
            </p>
          </div>
        ) : recent.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Aún no ha registrado incidencias con esta cuenta.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Puede registrar una nueva incidencia o consultar un reporte
              existente con su código.
            </p>
            <Link
              to="/cliente/nueva"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              <span>Registrar incidencia</span>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {recent.map(({ entry, tracking, error }) => (
              <li key={entry.id}>
                <Link
                  to={`/cliente/reportes/${entry.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatShortId(entry.id)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-600">
                      {tracking
                        ? tracking.report.description
                        : (error ?? 'Estado no disponible')}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Registrado: {formatDateTime(entry.registeredAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {tracking?.incidentStatus ? (
                      <StatusBadge
                        variant="status"
                        value={tracking.incidentStatus}
                      />
                    ) : (
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                        NO DISPONIBLE
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
