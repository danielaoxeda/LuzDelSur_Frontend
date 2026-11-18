import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  History,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { buildTimeline } from '../../../shared/utils/timeline';
import { technicianService } from '../services/technician.service';
import type {
  IncidentDetail,
  IncidentSummary,
} from '../types/technician.types';

export function TechnicianHistoryPage() {
  const { error: notifyError } = useNotification();

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyMine, setOnlyMine] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    null
  );
  const [auditDetail, setAuditDetail] = useState<IncidentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const refreshHistory = useCallback(
    async (mineFilter = onlyMine) => {
      setLoading(true);
      try {
        const list = await technicianService.getCompletedHistory({
          onlyMine: mineFilter,
        });
        setIncidents(list);
      } catch (err) {
        notifyError(
          'Error al cargar historial',
          extractApiErrorMessage(
            err,
            'No se pudo obtener el historial de incidencias.'
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [onlyMine, notifyError]
  );

  useEffect(() => {
    let active = true;
    technicianService
      .getCompletedHistory({ onlyMine })
      .then((list) => {
        if (active) setIncidents(list);
      })
      .catch((err) => {
        if (active) {
          notifyError(
            'Error al cargar historial',
            extractApiErrorMessage(
              err,
              'No se pudo obtener el historial de incidencias.'
            )
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onlyMine, notifyError]);

  const handleToggleOnlyMine = (nextValue: boolean) => {
    setLoading(true);
    setOnlyMine(nextValue);
  };

  const handleOpenAuditDetail = async (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setAuditDetail(null);
    setDetailError(null);
    setLoadingDetail(true);

    try {
      const res = await technicianService.getIncidentAuditDetail(incidentId);
      setAuditDetail(res);
    } catch (err) {
      setDetailError(
        extractApiErrorMessage(
          err,
          'No se pudo cargar el detalle de la incidencia.'
        )
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseAuditDetail = () => {
    setSelectedIncidentId(null);
    setAuditDetail(null);
    setDetailError(null);
  };

  const auditTimeline = useMemo(
    () =>
      auditDetail
        ? buildTimeline(auditDetail.history, auditDetail.statusHistory)
        : [],
    [auditDetail]
  );

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return incidents;
    return incidents.filter((item) => {
      const shortCode = formatShortId(item.id).toLowerCase();
      return (
        item.id.toLowerCase().includes(query) ||
        shortCode.includes(query) ||
        item.sector.toLowerCase().includes(query) ||
        formatFailureType(item.failureType).toLowerCase().includes(query)
      );
    });
  }, [incidents, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
          Historial de Tareas Cumplidas
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Registro consolidado de órdenes ejecutadas y cerradas en campo.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código (#INC-...) o sector..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0B132B] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => handleToggleOnlyMine(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-[#0B132B]"
              />
              <span>Solo mis atenciones</span>
            </label>

            <button
              type="button"
              onClick={() => void refreshHistory()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Cargando historial de incidencias cumplidas...
            </p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No se encontraron incidencias resueltas o cerradas.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Las tareas que marques como resueltas aparecerán en este registro.
            </p>
          </div>
        ) : (
          <>
            {/* Vista móvil en tarjetas (< md) */}
            <div className="divide-y divide-slate-200 md:hidden">
              {filteredIncidents.map((incident) => (
                <div key={incident.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {formatShortId(incident.id)}
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        {incident.sector}
                      </p>
                    </div>
                    <StatusBadge variant="status" value={incident.status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-800">
                      {formatFailureType(incident.failureType)}
                    </span>
                    <span>
                      Cierre:{' '}
                      <strong>
                        {formatDateTime(incident.closedAt ?? incident.updatedAt)}
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleOpenAuditDetail(incident.id)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B132B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Ver Acta</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Tabla para tablet/desktop (md+) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#0B132B] text-[11px] font-bold uppercase tracking-wider text-white">
                    <th className="px-6 py-3.5">N° Incidencia</th>
                    <th className="px-6 py-3.5">Fecha y Hora de Cierre</th>
                    <th className="px-6 py-3.5">Sector</th>
                    <th className="px-6 py-3.5">Tipo de Falla</th>
                    <th className="px-6 py-3.5">Prioridad</th>
                    <th className="px-6 py-3.5 text-center">Reportes</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {filteredIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {formatShortId(incident.id)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-slate-700">
                        {formatDateTime(incident.closedAt ?? incident.updatedAt)}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {incident.sector}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                          {formatFailureType(incident.failureType)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge
                          variant="priority"
                          value={incident.priorityLabel}
                        />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
                          {incident.reportCount}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge variant="status" value={incident.status} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void handleOpenAuditDetail(incident.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Ver Acta</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:px-6">
              Mostrando {filteredIncidents.length} de {incidents.length}{' '}
              órdenes completadas
            </div>
          </>
        )}
      </div>

      {/* Modal de Acta / Detalle de Cierre */}
      {selectedIncidentId && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-detail-modal-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2
                  id="history-detail-modal-title"
                  className="text-base font-extrabold text-slate-900"
                >
                  Acta de Cierre {formatShortId(selectedIncidentId)}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Registro de resolución y reportes consolidados
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAuditDetail}
                aria-label="Cerrar modal"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
                  <p className="mt-2 text-xs font-medium">
                    Cargando acta de la incidencia...
                  </p>
                </div>
              )}

              {detailError && !loadingDetail && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
                  {detailError}
                </div>
              )}

              {auditDetail && !loadingDetail && (
                <>
                  {/* Datos de IncidentSummary */}
                  <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <span className="text-sm font-bold text-slate-900">
                        Sector: {auditDetail.incident.sector}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          variant="status"
                          value={auditDetail.incident.status}
                        />
                        <StatusBadge
                          variant="priority"
                          value={auditDetail.incident.priorityLabel}
                        />
                        <StatusBadge
                          variant="certainty"
                          value={auditDetail.incident.certainty}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                      <div>
                        <span className="block font-semibold uppercase text-slate-400">
                          Tipo de Falla
                        </span>
                        <span className="mt-0.5 block font-bold text-slate-800">
                          {formatFailureType(auditDetail.incident.failureType)}
                        </span>
                      </div>
                      <div>
                        <span className="block font-semibold uppercase text-slate-400">
                          Fecha de Cierre
                        </span>
                        <span className="mt-0.5 block text-slate-700">
                          {formatDateTime(
                            auditDetail.incident.closedAt ??
                              auditDetail.incident.updatedAt
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="block font-semibold uppercase text-slate-400">
                          Reportes Consolidados
                        </span>
                        <span className="mt-0.5 block font-bold text-slate-800">
                          {auditDetail.incident.reportCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Historial de Auditoría */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <History className="h-4 w-4 text-slate-500" />
                      <span>
                        Observaciones e Historial ({auditTimeline.length})
                      </span>
                    </h3>

                    {auditTimeline.length === 0 ? (
                      <p className="rounded-lg border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                        No se registran observaciones.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <th className="px-3.5 py-2.5">Acción</th>
                              <th className="px-3.5 py-2.5">Responsable</th>
                              <th className="px-3.5 py-2.5">Observación Técnica</th>
                              <th className="px-3.5 py-2.5">Fecha</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {auditTimeline.map((entry) => (
                              <tr key={entry.key} className="hover:bg-slate-50/70">
                                <td className="whitespace-nowrap px-3.5 py-2.5 font-bold text-slate-800">
                                  {entry.action}
                                </td>
                                <td className="whitespace-nowrap px-3.5 py-2.5 font-medium text-slate-700">
                                  {entry.actor}
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-600">
                                  {entry.note || '—'}
                                </td>
                                <td className="whitespace-nowrap px-3.5 py-2.5 text-slate-500">
                                  {formatDateTime(entry.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Reportes Originales */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>
                        Reportes Atendidos ({auditDetail.reports.length})
                      </span>
                    </h3>

                    {auditDetail.reports.length === 0 ? (
                      <p className="rounded-lg border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                        Sin reportes vinculados.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <th className="px-3.5 py-2.5">Reporte</th>
                              <th className="px-3.5 py-2.5">Dirección / Ref.</th>
                              <th className="px-3.5 py-2.5">Descripción</th>
                              <th className="px-3.5 py-2.5">Estado Vínculo</th>
                              <th className="px-3.5 py-2.5">Fecha</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {auditDetail.reports.map((rep) => (
                              <tr key={rep.id} className="hover:bg-slate-50/70">
                                <td className="whitespace-nowrap px-3.5 py-2.5 font-mono font-semibold text-slate-800">
                                  #{rep.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  <p className="font-semibold text-slate-900">
                                    {rep.reference || 'Sin referencia'}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {rep.sector || 'Sin sector'}
                                  </p>
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-600">
                                  {rep.description}
                                </td>
                                <td className="whitespace-nowrap px-3.5 py-2.5">
                                  <StatusBadge
                                    variant="linkStatus"
                                    value={rep.linkStatus}
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3.5 py-2.5 text-slate-500">
                                  {formatDateTime(rep.reportedAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3.5">
              <button
                type="button"
                onClick={handleCloseAuditDetail}
                className="rounded-lg bg-[#0B132B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
