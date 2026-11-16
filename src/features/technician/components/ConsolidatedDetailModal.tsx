import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Loader2,
  MapPin,
  X,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { technicianService } from '../services/technician.service';
import type { TechnicianIncidentView } from '../types/technician.types';

interface ConsolidatedDetailModalProps {
  incidentId: string | null;
  onClose: () => void;
}

export function ConsolidatedDetailModal({
  incidentId,
  onClose,
}: ConsolidatedDetailModalProps) {
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [data, setData] = useState<TechnicianIncidentView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) return;

    let active = true;

    technicianService
      .getConsolidatedDetail(incidentId)
      .then((res) => {
        if (active) {
          setData(res);
          setError(null);
          setLoadedId(incidentId);
        }
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(
            extractApiErrorMessage(
              err,
              'No se pudo obtener el contexto consolidado de la incidencia.'
            )
          );
          setLoadedId(incidentId);
        }
      });

    return () => {
      active = false;
    };
  }, [incidentId]);

  if (!incidentId) return null;

  const loading = loadedId !== incidentId;
  const currentData = !loading ? data : null;
  const currentError = !loading ? error : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consolidated-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="consolidated-modal-title"
              className="text-base font-extrabold text-slate-900"
            >
              Detalle Consolidado de Incidencia {formatShortId(incidentId)}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Información general de la falla y reportes ciudadanos agrupados
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
              <p className="mt-2 text-xs font-medium">
                Cargando incidencia y reportes vinculados...
              </p>
            </div>
          )}

          {currentError && !loading && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
              {currentError}
            </div>
          )}

          {currentData && !loading && (
            <>
              {/* Resumen de la incidencia padre */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">
                      Sector: {currentData.sector}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge variant="status" value={currentData.status} />
                    <StatusBadge
                      variant="priority"
                      value={currentData.priorityLabel}
                    />
                    <StatusBadge
                      variant="certainty"
                      value={currentData.certainty}
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="block font-semibold uppercase text-slate-400">
                      Tipo de Falla
                    </span>
                    <span className="mt-0.5 block font-bold text-slate-800">
                      {formatFailureType(currentData.failureType)}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase text-slate-400">
                      Reportes Afectados
                    </span>
                    <span className="mt-0.5 block font-bold text-slate-800">
                      {currentData.affectedReports} reporte
                      {currentData.affectedReports === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase text-slate-400">
                      Puntaje de Prioridad
                    </span>
                    <span className="mt-0.5 block font-bold text-slate-800">
                      {currentData.priorityScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="block font-semibold uppercase text-slate-400">
                      Alcance Estimado
                    </span>
                    <span className="mt-0.5 block font-semibold text-slate-800">
                      {currentData.estimatedScope}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase text-slate-400">
                      Primer Reporte
                    </span>
                    <span className="mt-0.5 block text-slate-700">
                      {formatDateTime(currentData.firstReportedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase text-slate-400">
                      Último Reporte
                    </span>
                    <span className="mt-0.5 block text-slate-700">
                      {formatDateTime(currentData.lastReportedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advertencias */}
              {currentData.warnings && currentData.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Advertencias Operativas ({currentData.warnings.length})
                    </span>
                  </div>
                  <ul className="list-inside list-disc space-y-1 text-xs text-amber-900">
                    {currentData.warnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lista de reportes hijos vinculados */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>
                      Reportes Originales Vinculados (
                      {currentData.reports.length})
                    </span>
                  </h3>
                </div>

                {currentData.reports.length === 0 ? (
                  <p className="rounded-lg border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                    No hay reportes hijos vinculados actualmente.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-3.5 py-2.5">Reporte</th>
                          <th className="px-3.5 py-2.5">Dirección / Referencia</th>
                          <th className="px-3.5 py-2.5">Tipo Falla</th>
                          <th className="px-3.5 py-2.5">Descripción</th>
                          <th className="px-3.5 py-2.5">Estado Vínculo</th>
                          <th className="px-3.5 py-2.5">Fecha Reporte</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {currentData.reports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50/70">
                            <td className="whitespace-nowrap px-3.5 py-3 font-mono font-semibold text-slate-800">
                              #{report.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-3.5 py-3">
                              <p className="font-semibold text-slate-900">
                                {report.reference || 'Sin referencia'}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {report.sector || 'Sin sector'}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-3.5 py-3 font-medium text-slate-700">
                              {formatFailureType(report.failureType)}
                            </td>
                            <td className="max-w-xs px-3.5 py-3 text-slate-600">
                              {report.description}
                            </td>
                            <td className="whitespace-nowrap px-3.5 py-3">
                              <StatusBadge
                                variant="linkStatus"
                                value={report.linkStatus}
                              />
                            </td>
                            <td className="whitespace-nowrap px-3.5 py-3 text-slate-500">
                              {formatDateTime(report.reportedAt)}
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

        {/* Pie */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#0B132B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
