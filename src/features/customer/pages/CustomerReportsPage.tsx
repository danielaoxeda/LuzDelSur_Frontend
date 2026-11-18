import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  FolderOpen,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatReportShortId,
} from '../../../shared/components/StatusBadge';
import type { IncidentStatus } from '../../../shared/types/domain.types';
import { useMyReports } from '../hooks/useMyReports';

/** Paginacion fija del historial: 15 reportes por pagina. */
const PAGE_SIZE = 15;

const STATUS_ORDER: IncidentStatus[] = [
  'SUGERIDA',
  'CONFIRMADA',
  'EN_ATENCION',
  'REABIERTA',
  'RESUELTA',
  'CERRADA',
  'DESCARTADA',
];

type ReportOrder = 'recent' | 'status';

function statusRank(status?: IncidentStatus | null): number {
  if (!status) return STATUS_ORDER.length;
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? STATUS_ORDER.length : index;
}

export function CustomerReportsPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<ReportOrder>('recent');
  const { items, loading, error, total, reload } = useMyReports();

  const orderedItems = useMemo(() => {
    const copy = [...items];

    if (order === 'status') {
      copy.sort((a, b) => {
        const difference =
          statusRank(a.tracking?.incidentStatus) -
          statusRank(b.tracking?.incidentStatus);
        if (difference !== 0) return difference;
        return b.entry.registeredAt.localeCompare(a.entry.registeredAt);
      });
      return copy;
    }

    copy.sort((a, b) => b.entry.registeredAt.localeCompare(a.entry.registeredAt));
    return copy;
  }, [items, order]);

  const totalPages = Math.max(1, Math.ceil(orderedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = orderedItems.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );
  const hasPrevious = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <div>
              <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
                Historial de Reportes
              </h1>
              <p className="text-xs text-slate-500">
                Reportes registrados con tu cuenta.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Actualizar</span>
            </button>
            <Link
              to="/cliente/nueva"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
            >
              <span>Nueva incidencia</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#F8FAFC] px-4 py-2.5 sm:px-6">
          <p className="text-[11px] font-semibold text-slate-600">
            {total === 0
              ? 'Sin reportes registrados'
              : `${total} reporte(s) en tu historial`}
          </p>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            Ordenar
            <select
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as ReportOrder);
                setPage(0);
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="recent">Más recientes</option>
              <option value="status">Por estado</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:mx-6">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-xs font-semibold leading-relaxed text-amber-900">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Consultando el estado de sus reportes...
            </p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {error
                ? 'No se pudo cargar el historial de reportes.'
                : 'Aún no registró reportes con esta cuenta.'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {error
                ? 'Verifique la conexión con el servidor e intente actualizar.'
                : 'Registre una nueva incidencia para verla en este historial.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {pageItems.map(({ entry, tracking }) => (
                <div key={entry.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900">
                        {formatReportShortId(entry.id)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                        {entry.id}
                      </p>
                    </div>
                    {tracking?.incidentStatus ? (
                      <StatusBadge
                        variant="status"
                        value={tracking.incidentStatus}
                      />
                    ) : (
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        NO DISPONIBLE
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {tracking && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {formatFailureType(tracking.report.failureType)}
                      </span>
                    )}
                    {tracking?.certainty && (
                      <StatusBadge
                        variant="certainty"
                        value={tracking.certainty}
                      />
                    )}
                  </div>

                  <p className="text-xs text-slate-700">
                    {tracking
                      ? tracking.report.description
                      : (error ?? 'Estado no disponible')}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>Registrado: {formatDateTime(entry.registeredAt)}</span>
                    <span>
                      {tracking?.report.sector ?? 'Sector no informado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/cliente/reportes/${entry.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                    >
                      <span>Ver seguimiento</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Código</th>
                    <th className="px-6 py-3.5">Falla</th>
                    <th className="px-6 py-3.5">Descripción</th>
                    <th className="px-6 py-3.5">Registrado</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">Certeza</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {pageItems.map(({ entry, tracking }) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {formatReportShortId(entry.id)}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                          {entry.id}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-slate-700">
                        {tracking
                          ? formatFailureType(tracking.report.failureType)
                          : '—'}
                      </td>
                      <td className="max-w-[340px] px-6 py-4">
                        <p className="truncate text-xs text-slate-700">
                          {tracking
                            ? tracking.report.description
                            : (error ?? 'Estado no disponible')}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {tracking?.report.sector ?? 'Sector no informado'}
                          {tracking?.report.reference
                            ? ` · ${tracking.report.reference}`
                            : ''}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(entry.registeredAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {tracking?.incidentStatus ? (
                          <StatusBadge
                            variant="status"
                            value={tracking.incidentStatus}
                          />
                        ) : (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            NO DISPONIBLE
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {tracking?.certainty ? (
                          <StatusBadge
                            variant="certainty"
                            value={tracking.certainty}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          to={`/cliente/reportes/${entry.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                        >
                          <span>Seguimiento</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:px-6">
          <p className="text-[11px] font-semibold text-slate-600">
            {total === 0
              ? 'Sin resultados'
              : `Página ${currentPage + 1} de ${Math.max(totalPages, 1)}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
