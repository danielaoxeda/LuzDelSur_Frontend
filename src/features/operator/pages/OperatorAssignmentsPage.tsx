import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  Wrench,
} from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatIncidentStatus,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type {
  FailureType,
  IncidentStatus,
  PageResponse,
} from '../../../shared/types/domain.types';
import { AssignTechnicianModal } from '../components/AssignTechnicianModal';
import { operatorService } from '../services/operator.service';
import type { IncidentSummary } from '../types/operator.types';

const ASSIGNABLE_STATUSES: IncidentStatus[] = [
  'CONFIRMADA',
  'EN_ATENCION',
  'REABIERTA',
];

const FAILURE_OPTIONS: FailureType[] = [
  'CORTE_TOTAL',
  'BAJA_TENSION',
  'INTERMITENCIA',
  'MEDIDOR',
  'ALUMBRADO_PUBLICO',
  'OTRO',
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function OperatorAssignmentsPage() {
  const { success, error: notifyError } = useNotification();

  const [activeStatus, setActiveStatus] = useState<IncidentStatus>('CONFIRMADA');
  const [sectorDraft, setSectorDraft] = useState('');
  const [appliedSector, setAppliedSector] = useState('');
  const [failureType, setFailureType] = useState<FailureType | ''>('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [data, setData] = useState<PageResponse<IncidentSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [assignTarget, setAssignTarget] = useState<IncidentSummary | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const refresh = () => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    operatorService
      .getIncidents({
        status: activeStatus,
        failureType: failureType || undefined,
        sector: appliedSector.trim() || undefined,
        onlyOpen: true,
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
          extractApiErrorMessage(err, 'No se pudieron cargar los casos.')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeStatus, failureType, appliedSector, page, size, reloadKey]);

  const handleApplySector = () => {
    setLoading(true);
    setAppliedSector(sectorDraft);
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const handleClearFilters = () => {
    setLoading(true);
    setSectorDraft('');
    setAppliedSector('');
    setFailureType('');
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const handleAssign = async (technicianId: string, note?: string) => {
    if (!assignTarget || actionBusy) return;
    setActionBusy(true);
    try {
      const updated = await operatorService.assignTechnician(assignTarget.id, {
        technicianId,
        ...(note ? { note } : {}),
      });
      setData((current) =>
        current
          ? {
              ...current,
              content: current.content.map((incident) =>
                incident.id === updated.incident.id
                  ? updated.incident
                  : incident
              ),
            }
          : current
      );
      setAssignTarget(null);
      success(
        'Técnico asignado',
        `El caso ${formatShortId(updated.incident.id)} quedó asignado a ${
          updated.incident.assignedTechnicianName ?? 'el técnico seleccionado'
        }.`
      );
    } catch (err) {
      notifyError('No se pudo asignar el técnico', extractApiErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  };

  const incidents = (data?.content ?? []).filter(
    (incident) => !onlyUnassigned || !incident.assignedTechnicianId
  );
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasPrevious = page > 0;
  const hasNext = totalPages > 0 && page < totalPages - 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Asignación de Reportes
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Los reportes se asignan a un técnico a través del caso que los
            agrupa. Solo los casos CONFIRMADA, EN ATENCIÓN o REABIERTA admiten
            asignación.
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

      {loadError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-semibold leading-relaxed text-amber-900">
            {loadError}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {ASSIGNABLE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setLoading(true);
                setActiveStatus(status);
                setPage(0);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                activeStatus === status
                  ? 'bg-[#0B132B] text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{formatIncidentStatus(status)}</span>
            </button>
          ))}
        </div>

        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleApplySector();
          }}
        >
          <div>
            <label
              htmlFor="assignment-sector"
              className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Sector
            </label>
            <input
              id="assignment-sector"
              type="text"
              value={sectorDraft}
              onChange={(event) => setSectorDraft(event.target.value)}
              placeholder="Ej. San Isidro"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="assignment-failure"
              className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Tipo de falla
            </label>
            <select
              id="assignment-failure"
              value={failureType}
              onChange={(event) => {
                setLoading(true);
                setFailureType(event.target.value as FailureType | '');
                setPage(0);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos</option>
              {FAILURE_OPTIONS.map((failure) => (
                <option key={failure} value={failure}>
                  {formatFailureType(failure)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0B132B] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Aplicar</span>
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>

          <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyUnassigned}
              onChange={(event) => setOnlyUnassigned(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Solo sin asignar
          </label>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Casos {formatIncidentStatus(activeStatus).toLowerCase()}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {incidents.length}
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
              Consultando los casos asignables...
            </p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No hay casos para este filtro.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Cambie el estado o quite el filtro de asignación.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Caso</th>
                  <th className="px-6 py-3.5">Sector / Falla</th>
                  <th className="px-6 py-3.5">Prioridad</th>
                  <th className="px-6 py-3.5 text-center">Reportes</th>
                  <th className="px-6 py-3.5">Técnico asignado</th>
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
                      <div className="mt-1">
                        <StatusBadge
                          variant="status"
                          value={incident.status}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {incident.sector}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatFailureType(incident.failureType)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge
                          variant="certainty"
                          value={incident.certainty}
                        />
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

                    <td className="px-6 py-4">
                      {incident.assignedTechnicianId ? (
                        <>
                          <p className="text-xs font-semibold text-slate-900">
                            {incident.assignedTechnicianName ??
                              incident.assignedTechnicianId}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Desde {formatDateTime(incident.assignedAt)}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          Sin asignar
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => setAssignTarget(incident)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:opacity-40"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>
                            {incident.assignedTechnicianId
                              ? 'Reasignar'
                              : 'Asignar'}
                          </span>
                        </button>
                        <Link
                          to={`/operador/incidencias/${incident.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <span>Ver caso</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
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
                )} · ${totalElements} caso(s) en el estado`}
            {onlyUnassigned && totalElements > 0
              ? ` · ${incidents.length} sin asignar en esta página`
              : ''}
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

      {assignTarget && (
        <AssignTechnicianModal
          incident={assignTarget}
          isSubmitting={actionBusy}
          onCancel={() => {
            if (!actionBusy) setAssignTarget(null);
          }}
          onConfirm={(technicianId, note) =>
            void handleAssign(technicianId, note)
          }
        />
      )}
    </div>
  );
}
