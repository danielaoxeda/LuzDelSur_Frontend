import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  History,
  Inbox,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
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
import type {
  FailureType,
  IncidentStatus,
  PageResponse,
} from '../../../shared/types/domain.types';
import { operatorService } from '../services/operator.service';
import type { IncidentSummary } from '../types/operator.types';

/** Paginacion fija de la bandeja: 10 casos por pagina. */
const PAGE_SIZE = 10;

type QueueKey = 'all' | 'review' | 'confirmed' | 'active';

interface QueueOption {
  key: QueueKey;
  label: string;
  hint: string;
  status?: IncidentStatus;
}

const QUEUES: QueueOption[] = [
  { key: 'all', label: 'Todos abiertos', hint: 'Casos abiertos en cualquier etapa.' },
  {
    key: 'review',
    label: 'Por revisar',
    hint: 'Casos sugeridos que esperan tu confirmación.',
    status: 'SUGERIDA',
  },
  {
    key: 'confirmed',
    label: 'Confirmadas',
    hint: 'Casos confirmados: asigna técnico y sigue el caso.',
    status: 'CONFIRMADA',
  },
  {
    key: 'active',
    label: 'En atención',
    hint: 'Casos con técnico trabajando en campo.',
    status: 'EN_ATENCION',
  },
];

const FAILURE_OPTIONS: { value: FailureType; label: string }[] = [
  { value: 'CORTE_TOTAL', label: 'Corte Total' },
  { value: 'BAJA_TENSION', label: 'Baja Tensión' },
  { value: 'INTERMITENCIA', label: 'Intermitencia' },
  { value: 'MEDIDOR', label: 'Medidor' },
  { value: 'ALUMBRADO_PUBLICO', label: 'Alumbrado Público' },
  { value: 'OTRO', label: 'Otro' },
];

function actionLabel(incident: IncidentSummary): string {
  if (incident.status === 'SUGERIDA') return 'Revisar agrupación';
  if (incident.status === 'CONFIRMADA' || incident.status === 'REABIERTA') {
    return incident.assignedTechnicianId ? 'Ver caso' : 'Asignar técnico';
  }
  if (incident.status === 'EN_ATENCION') return 'Ver seguimiento';
  return 'Ver caso';
}

export function OperatorInboxPage() {
  const { error: notifyError } = useNotification();

  const [queue, setQueue] = useState<QueueKey>('all');
  const [sectorInput, setSectorInput] = useState('');
  const [failureInput, setFailureInput] = useState<FailureType | ''>('');
  const [sector, setSector] = useState('');
  const [failureType, setFailureType] = useState<FailureType | ''>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<IncidentSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeQueue = QUEUES.find((option) => option.key === queue) ?? QUEUES[0];
  const statusFilter = activeQueue.status;

  const refresh = () => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    operatorService
      .getIncidents({
        status: statusFilter,
        failureType: failureType || undefined,
        sector: sector || undefined,
        onlyOpen: true,
        page,
        size: PAGE_SIZE,
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
  }, [statusFilter, failureType, sector, page, reloadKey, notifyError]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setReloadKey((value) => value + 1);
      }
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const selectQueue = (next: QueueKey) => {
    if (next === queue) return;
    setLoading(true);
    setQueue(next);
    setPage(0);
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSector(sectorInput.trim());
    setFailureType(failureInput);
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const clearFilters = () => {
    setSectorInput('');
    setFailureInput('');
    setSector('');
    setFailureType('');
    setPage(0);
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  const incidents = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasPrevious = page > 0;
  const hasNext = totalPages > 0 && page < totalPages - 1;
  const hasFilters = Boolean(sector || failureType);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Bandeja de Gestión
          </h1>
          <p className="mt-0.5 max-w-2xl text-xs text-slate-500">
            Cada caso agrupa reportes del mismo sector y tipo de falla. Aquí
            confirmas la agrupación, asignas al técnico y sigues el caso.
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

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-[11px] leading-relaxed text-blue-900 sm:px-5">
        <p className="font-bold uppercase tracking-wider">Flujo del caso</p>
        <p className="mt-1.5">
          <span className="font-semibold">1.</span> Revisa los casos{' '}
          <span className="font-semibold">Por revisar</span> y confirma la
          agrupación (o separa los reportes que no correspondan).{' '}
          <span className="font-semibold">2.</span> Asigna un técnico al caso
          confirmado. <span className="font-semibold">3.</span> Sigue el caso
          hasta resolverlo y cerrarlo.
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-1">
          <History className="h-3.5 w-3.5" />
          <span>Los reportes individuales se consultan en</span>
          <Link
            to="/operador/reportes"
            className="font-semibold text-blue-800 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
          >
            Historial de Reportes
          </Link>
          .
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap gap-2">
          {QUEUES.map((option) => {
            const isActive = option.key === queue;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => selectQueue(option.key)}
                disabled={loading && !isActive}
                title={option.hint}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                  isActive
                    ? 'border-[#0B132B] bg-[#0B132B] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={applyFilters}
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={sectorInput}
              onChange={(event) => setSectorInput(event.target.value)}
              placeholder="Buscar por sector (ej. San Isidro)"
              aria-label="Sector"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={failureInput}
            onChange={(event) =>
              setFailureInput(event.target.value as FailureType | '')
            }
            aria-label="Tipo de falla"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tipo de falla: todos</option>
            {FAILURE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Limpiar</span>
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Buscar</span>
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              {activeQueue.label}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {totalElements}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{activeQueue.hint}</p>
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
              No hay casos en esta vista.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasFilters
                ? 'Prueba con otro sector, otro tipo de falla o revisa otra cola.'
                : 'Cuando el sistema agrupe nuevos reportes aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {incidents.map((incident) => (
              <li
                key={incident.id}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatShortId(incident.id)}
                    </span>
                    <StatusBadge variant="status" value={incident.status} />
                    <StatusBadge
                      variant="priority"
                      value={incident.priorityLabel}
                    />
                    {(incident.requiresReview ||
                      incident.certainty === 'BAJA') && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        <ShieldAlert className="h-3 w-3" />
                        Requiere revisión
                      </span>
                    )}
                  </div>

                  <p className="truncate text-sm font-semibold text-slate-800">
                    {incident.sector}
                    <span className="font-normal text-slate-500">
                      {' '}
                      · {formatFailureType(incident.failureType)}
                    </span>
                  </p>

                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                    <span>
                      {incident.reportCount} reporte(s) agrupado(s)
                    </span>
                    <span>·</span>
                    <span>
                      {incident.assignedTechnicianName
                        ? `Técnico: ${incident.assignedTechnicianName}`
                        : 'Sin técnico asignado'}
                    </span>
                    <span>·</span>
                    <span>Actualizado {formatDateTime(incident.updatedAt)}</span>
                  </p>
                </div>

                <Link
                  to={`/operador/incidencias/${incident.id}`}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors lg:self-center ${
                    incident.status === 'SUGERIDA'
                      ? 'bg-[#0B132B] text-white hover:bg-slate-900'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <span>{actionLabel(incident)}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:px-6">
          <p className="text-[11px] font-semibold text-slate-600">
            {totalElements === 0
              ? 'Sin resultados'
              : `Página ${page + 1} de ${Math.max(totalPages, 1)} · ${totalElements} caso(s)`}
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

      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        La bandeja solo muestra casos abiertos; los cerrados quedan en el
        historial del caso y en el historial de reportes.
      </p>
    </div>
  );
}
