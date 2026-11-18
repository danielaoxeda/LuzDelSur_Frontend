import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatReportShortId,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type {
  PageResponse,
  ReportView,
} from '../../../shared/types/domain.types';
import { ReportHistoryFilters } from '../components/ReportHistoryFilters';
import { SimilarityIndicator } from '../components/SimilarityIndicator';
import { operatorService } from '../services/operator.service';
import {
  EMPTY_REPORT_FILTERS,
  type ReportFilterValues,
} from '../types/report-filters.types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Convierte una fecha (yyyy-MM-dd) de Lima a un Instant ISO. */
function toInstant(date: string, endOfDay: boolean): string | undefined {
  if (!date) return undefined;
  const time = endOfDay ? '23:59:59' : '00:00:00';
  const parsed = new Date(`${date}T${time}-05:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function OperatorReportsHistoryPage() {
  const { error: notifyError } = useNotification();

  const [draft, setDraft] = useState<ReportFilterValues>(EMPTY_REPORT_FILTERS);
  const [applied, setApplied] = useState<ReportFilterValues>(
    EMPTY_REPORT_FILTERS
  );
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [data, setData] = useState<PageResponse<ReportView> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    operatorService
      .getReports({
        incidentId: applied.incidentId.trim() || undefined,
        linkStatus: applied.linkStatus || undefined,
        failureType: applied.failureType || undefined,
        sector: applied.sector.trim() || undefined,
        from: toInstant(applied.from, false),
        to: toInstant(applied.to, true),
        page,
        size,
      })
      .then((response) => {
        if (!active) return;
        setData(response);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          extractApiErrorMessage(err, 'No se pudo cargar el historial.')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applied, page, size, reloadKey]);

  const handleApply = () => {
    const incidentId = draft.incidentId.trim();
    if (incidentId && !UUID_PATTERN.test(incidentId)) {
      notifyError(
        'Caso inválido',
        'El identificador del caso debe ser un UUID completo, por ejemplo 3f2a1c4e-...'
      );
      return;
    }
    if (draft.from && draft.to && draft.from > draft.to) {
      notifyError(
        'Rango de fechas inválido',
        'La fecha "Desde" no puede ser posterior a la fecha "Hasta".'
      );
      return;
    }

    setLoading(true);
    setApplied({ ...draft, incidentId });
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const handleClear = () => {
    setLoading(true);
    setDraft(EMPTY_REPORT_FILTERS);
    setApplied(EMPTY_REPORT_FILTERS);
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const reports = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasPrevious = page > 0;
  const hasNext = totalPages > 0 && page < totalPages - 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Historial de Reportes
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Reportes individuales registrados por los clientes, con filtros por
            caso, vínculo, falla, sector y rango de fechas.
          </p>
        </div>

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

      <ReportHistoryFilters
        values={draft}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onApply={handleApply}
        onClear={handleClear}
        isLoading={loading}
      />

      {loadError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-semibold leading-relaxed text-amber-900">
            {loadError}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Reportes</h2>
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
              Consultando el historial de reportes...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No hay reportes que coincidan con los filtros.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ajuste el caso, las fechas o el tipo de falla.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Reporte</th>
                  <th className="px-6 py-3.5">Caso</th>
                  <th className="px-6 py-3.5">Ubicación / Falla</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5">Vínculo</th>
                  <th className="px-6 py-3.5">Similitud</th>
                  <th className="px-6 py-3.5">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="align-top transition-colors hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {formatReportShortId(report.id)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatDateTime(report.reportedAt)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                        {report.id}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      {report.incidentId ? (
                        <Link
                          to={`/operador/incidencias/${report.incidentId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                        >
                          <span>{formatShortId(report.incidentId)}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sin caso vinculado
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {report.sector ?? 'Sector no informado'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {report.reference ?? 'Sin referencia'}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-600">
                        {formatFailureType(report.failureType)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="max-w-[360px] whitespace-pre-line text-xs leading-relaxed text-slate-700">
                        {report.description}
                      </p>
                      {report.groupingReason && (
                        <p className="mt-1 max-w-[360px] text-[11px] leading-relaxed text-slate-500">
                          Motivo: {report.groupingReason}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge
                        variant="linkStatus"
                        value={report.linkStatus}
                      />
                      {report.certainty && (
                        <div className="mt-1">
                          <StatusBadge
                            variant="certainty"
                            value={report.certainty}
                          />
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <SimilarityIndicator similarity={report.similarity} />
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                      {formatDateTime(report.linkUpdatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:px-6">
          <p className="text-[11px] font-semibold text-slate-600">
            {totalElements === 0
              ? 'Sin resultados'
              : `Página ${page + 1} de ${Math.max(
                  totalPages,
                  1
                )} · ${totalElements} reporte(s)`}
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
