import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Inbox,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type { PageResponse } from '../../../shared/types/domain.types';
import {
  EMPTY_INBOX_FILTERS,
  type InboxFilterValues,
} from '../types/inbox-filters.types';
import { IncidentFilters } from '../components/IncidentFilters';
import { operatorService } from '../services/operator.service';
import type { IncidentSummary } from '../types/operator.types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function OperatorInboxPage() {
  const { error: notifyError } = useNotification();

  const [draft, setDraft] = useState<InboxFilterValues>(EMPTY_INBOX_FILTERS);
  const [applied, setApplied] = useState<InboxFilterValues>(EMPTY_INBOX_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [data, setData] = useState<PageResponse<IncidentSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    operatorService
      .getIncidents({
        status: applied.status || undefined,
        certainty: applied.certainty || undefined,
        requiresReview:
          applied.requiresReview === ''
            ? undefined
            : applied.requiresReview === 'true',
        failureType: applied.failureType || undefined,
        sector: applied.sector.trim() || undefined,
        onlyOpen: applied.onlyOpen,
        page,
        size,
      })
      .then((response) => {
        if (!active) return;
        setData(response);
        setLastUpdated(new Date().toISOString());
      })
      .catch((err) => {
        if (!active) return;
        notifyError(
          'No se pudo cargar la bandeja',
          extractApiErrorMessage(err)
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applied, page, size, reloadKey, notifyError]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setReloadKey((value) => value + 1);
      }
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Si los filtros no cambian, React no vuelve a ejecutar el efecto y el
  // spinner quedaria girando; reloadKey fuerza siempre una nueva consulta.
  const handleApply = () => {
    setLoading(true);
    setApplied(draft);
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const handleClear = () => {
    setLoading(true);
    setDraft(EMPTY_INBOX_FILTERS);
    setApplied(EMPTY_INBOX_FILTERS);
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const incidents = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasPrevious = page > 0;
  const hasNext = totalPages > 0 && page < totalPages - 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Bandeja de Gestión
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Incidencias ordenadas por prioridad. La agrupación la propone el
            backend; la validación es del operador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastUpdated && (
            <span className="hidden text-[11px] text-slate-500 sm:inline">
              Actualizado: {formatDateTime(lastUpdated)}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <IncidentFilters
        values={draft}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onApply={handleApply}
        onClear={handleClear}
        isLoading={loading}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Incidencias
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {totalElements}
            </span>
          </div>

          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            Filas por página
            <select
              value={size}
              onChange={(event) => {
                setLoading(true);
                setSize(Number(event.target.value));
                setPage(0);
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Consultando la bandeja priorizada...
            </p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No hay incidencias que coincidan con los filtros.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ajuste los filtros o actualice la bandeja.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {incidents.map((incident) => (
                <div key={incident.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {formatShortId(incident.id)}
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        {incident.sector}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatFailureType(incident.failureType)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge variant="status" value={incident.status} />
                      <StatusBadge
                        variant="priority"
                        value={incident.priorityLabel}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      variant="certainty"
                      value={incident.certainty}
                    />
                    {incident.requiresReview && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        <ShieldAlert className="h-3 w-3" />
                        REVISIÓN
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">
                      {incident.reportCount} reporte(s) · score{' '}
                      {incident.priorityScore.toFixed(1)}
                    </span>
                  </div>

                  <Link
                    to={`/operador/incidencias/${incident.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                  >
                    <span>Gestionar caso</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">N° Incidencia</th>
                    <th className="px-6 py-3.5">Sector / Falla</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">Certeza</th>
                    <th className="px-6 py-3.5">Prioridad</th>
                    <th className="px-6 py-3.5 text-center">Reportes</th>
                    <th className="px-6 py-3.5">Última act.</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {formatShortId(incident.id)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatDateTime(incident.firstReportedAt)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {incident.sector}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatFailureType(incident.failureType)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge
                          variant="status"
                          value={incident.status}
                        />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge
                            variant="certainty"
                            value={incident.certainty}
                          />
                          {incident.requiresReview && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                              <AlertTriangle className="h-3 w-3" />
                              Baja certeza
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            variant="priority"
                            value={incident.priorityLabel}
                          />
                          <span className="text-[11px] font-semibold text-slate-500">
                            {incident.priorityScore.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
                          {incident.reportCount}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(incident.updatedAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          to={`/operador/incidencias/${incident.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                        >
                          <span>Gestionar</span>
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
            {totalElements === 0
              ? 'Sin resultados'
              : `Página ${page + 1} de ${Math.max(totalPages, 1)} · ${totalElements} incidencia(s)`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => {
                setLoading(true);
                setPage((current) => Math.max(current - 1, 0));
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => {
                setLoading(true);
                setPage((current) => current + 1);
              }}
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
