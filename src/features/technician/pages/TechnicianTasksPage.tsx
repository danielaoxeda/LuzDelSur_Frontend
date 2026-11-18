import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  ListChecks,
  Loader2,
  Play,
  RefreshCw,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { ConsolidatedDetailModal } from '../components/ConsolidatedDetailModal';
import { ResolveIncidentModal } from '../components/ResolveIncidentModal';
import { technicianService } from '../services/technician.service';
import type { IncidentSummary } from '../types/technician.types';

export function TechnicianTasksPage() {
  const { success, error: notifyError } = useNotification();

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [incidentToResolve, setIncidentToResolve] =
    useState<IncidentSummary | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    try {
      const list = await technicianService.getAssignedTasks();
      setIncidents(list);
    } catch (err) {
      notifyError(
        'Error al cargar tareas',
        extractApiErrorMessage(err, 'No se pudieron obtener las incidencias.')
      );
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    let active = true;
    technicianService
      .getAssignedTasks()
      .then((list) => {
        if (active) setIncidents(list);
      })
      .catch((err) => {
        if (active) {
          notifyError(
            'Error al cargar tareas',
            extractApiErrorMessage(
              err,
              'No se pudieron obtener las incidencias.'
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
  }, [notifyError]);

  const handleStartAttention = async (incident: IncidentSummary) => {
    setProcessingId(incident.id);
    try {
      await technicianService.changeStatus(incident.id, {
        status: 'EN_ATENCION',
        note: 'Cuadrilla en camino',
      });
      success(
        'Atención iniciada',
        `El caso ${formatShortId(incident.id)} pasó al estado En Atención.`
      );
      await refreshTasks();
    } catch (err) {
      notifyError('No se pudo iniciar atención', extractApiErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmResolve = async (incidentId: string, note: string) => {
    setProcessingId(incidentId);
    try {
      await technicianService.changeStatus(incidentId, {
        status: 'RESUELTA',
        note: note || 'Suministro restablecido',
      });
      success(
        'Incidencia resuelta',
        `El caso ${formatShortId(incidentId)} fue marcado como Resuelta.`
      );
      setIncidentToResolve(null);
      await refreshTasks();
    } catch (err) {
      notifyError(
        'No se pudo resolver la incidencia',
        extractApiErrorMessage(err)
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Encabezado de tarjeta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2.5">
            <ListChecks className="h-5 w-5 text-blue-600" />
            <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
              Tareas Asignadas en Campo
            </h1>
          </div>

          <button
            type="button"
            onClick={() => void refreshTasks()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Consultando tus incidencias asignadas...
            </p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No tienes incidencias asignadas pendientes de atención.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Cuando el operador te asigne un caso confirmado, aparecerá en esta bandeja.
            </p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móvil (< md) */}
            <div className="divide-y divide-slate-200 md:hidden">
              {incidents.map((incident) => {
                const isBusy = processingId === incident.id;
                const canStart =
                  incident.status === 'CONFIRMADA' ||
                  incident.status === 'REABIERTA';
                const canResolve = incident.status === 'EN_ATENCION';

                return (
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
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <StatusBadge
                          variant="priority"
                          value={incident.priorityLabel}
                        />
                        <StatusBadge variant="status" value={incident.status} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                      <span>
                        Falla:{' '}
                        <strong className="text-slate-800">
                          {formatFailureType(incident.failureType)}
                        </strong>
                      </span>
                      <span>
                        Reportes:{' '}
                        <strong className="text-slate-800">
                          {incident.reportCount}
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailId(incident.id)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Detalles</span>
                      </button>

                      {canStart && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleStartAttention(incident)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>
                            {isBusy ? 'Procesando...' : 'Iniciar Atención'}
                          </span>
                        </button>
                      )}

                      {canResolve && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setIncidentToResolve(incident)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0B132B] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Marcar Resuelto</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabla para tablet/desktop (md+) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">N° Incidencia</th>
                    <th className="px-6 py-3.5">Sector</th>
                    <th className="px-6 py-3.5">Tipo de Falla</th>
                    <th className="px-6 py-3.5">Prioridad</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-center">Reportes</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {incidents.map((incident) => {
                    const isBusy = processingId === incident.id;
                    const canStart =
                      incident.status === 'CONFIRMADA' ||
                      incident.status === 'REABIERTA';
                    const canResolve = incident.status === 'EN_ATENCION';

                    return (
                      <tr
                        key={incident.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-bold text-slate-900">
                            {formatShortId(incident.id)}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            {formatDateTime(incident.firstReportedAt)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">
                            {incident.sector}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-700">
                          {formatFailureType(incident.failureType)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge
                            variant="priority"
                            value={incident.priorityLabel}
                          />
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge
                            variant="status"
                            value={incident.status}
                          />
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
                            {incident.reportCount}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailId(incident.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Ver Detalles</span>
                            </button>

                            {canStart && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleStartAttention(incident)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                              >
                                <Play className="h-3.5 w-3.5" />
                                <span>
                                  {isBusy ? 'Procesando...' : 'Iniciar Atención'}
                                </span>
                              </button>
                            )}

                            {canResolve && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setIncidentToResolve(incident)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Marcar Resuelto</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalle Consolidado */}
      <ConsolidatedDetailModal
        incidentId={selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
      />

      {/* Modal de Resolución */}
      <ResolveIncidentModal
        incident={incidentToResolve}
        isSubmitting={Boolean(processingId)}
        onClose={() => setIncidentToResolve(null)}
        onConfirmResolve={handleConfirmResolve}
      />
    </div>
  );
}
