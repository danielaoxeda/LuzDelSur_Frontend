import { useEffect, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Timer,
  UserX,
} from 'lucide-react';
import {
  formatDateTime,
  formatFailureType,
  formatIncidentStatus,
  formatPriorityLabel,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type {
  FailureType,
  IncidentStatus,
  PriorityLabel,
} from '../../../shared/types/domain.types';
import { operatorService } from '../services/operator.service';
import type { MetricsView } from '../types/operator.types';

interface MetricCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  iconClasses: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  iconClasses,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{hint}</p>
    </div>
  );
}

interface DistributionRow {
  label: string;
  value: number;
}

function DistributionPanel({
  title,
  subtitle,
  rows,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  rows: DistributionRow[];
  emptyLabel: string;
}) {
  const max = rows.reduce((acc, row) => Math.max(acc, row.value), 1);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-slate-500 sm:px-5">
          {emptyLabel}
        </p>
      ) : (
        <ul className="space-y-3 px-4 py-4 sm:px-5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-semibold text-slate-700">
                  {row.label}
                </span>
                <span className="font-bold text-slate-900">{row.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0B132B]"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value < 60) {
    return Number.isInteger(value) ? `${value} min` : `${value.toFixed(1)} min`;
  }
  const rounded = Math.round(value);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function OperatorDashboardPage() {
  const { error: notifyError } = useNotification();

  const [metrics, setMetrics] = useState<MetricsView | null>(null);
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
      .getMetrics()
      .then((data) => {
        if (!active) return;
        setMetrics(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          extractApiErrorMessage(err, 'No se pudieron cargar los indicadores.')
        );
        notifyError(
          'No se pudo cargar el panel',
          extractApiErrorMessage(err)
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, notifyError]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setReloadKey((value) => value + 1);
      }
    }, 45000);
    return () => window.clearInterval(timer);
  }, []);

  const statusRows: DistributionRow[] = metrics
    ? (Object.keys(metrics.byStatus) as IncidentStatus[])
        .map((status) => ({
          label: formatIncidentStatus(status),
          value: metrics.byStatus[status] ?? 0,
        }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  const priorityRows: DistributionRow[] = metrics
    ? (Object.keys(metrics.openByPriority) as PriorityLabel[])
        .map((priority) => ({
          label: formatPriorityLabel(priority),
          value: metrics.openByPriority[priority] ?? 0,
        }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  const failureRows: DistributionRow[] = metrics
    ? (Object.keys(metrics.openByFailureType) as FailureType[])
        .map((failure) => ({
          label: formatFailureType(failure),
          value: metrics.openByFailureType[failure] ?? 0,
        }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Panel de Monitoreo
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Indicadores calculados por el backend sobre las incidencias y
            reportes vigentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {metrics && (
            <span className="hidden text-[11px] text-slate-500 sm:inline">
              Generado: {formatDateTime(metrics.generatedAt)}
            </span>
          )}
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
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-semibold leading-relaxed text-amber-900">
            No se pudieron actualizar los indicadores: {loadError}
          </p>
        </div>
      )}

      {loading && !metrics ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
          <p className="mt-2 text-xs font-medium">
            Calculando indicadores del panel...
          </p>
        </div>
      ) : metrics ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Activity}
              label="Incidencias abiertas"
              value={String(metrics.openIncidents)}
              hint="Casos SUGERIDA, CONFIRMADA, EN ATENCIÓN o REABIERTA."
              iconClasses="bg-blue-50 text-blue-700"
            />
            <MetricCard
              icon={ShieldAlert}
              label="Pendientes de revisión"
              value={String(metrics.pendingReview)}
              hint="Casos SUGERIDA que esperan confirmación del operador."
              iconClasses="bg-amber-50 text-amber-700"
            />
            <MetricCard
              icon={UserX}
              label="Confirmadas sin asignar"
              value={String(metrics.unassignedConfirmed)}
              hint="Casos confirmados que aún no tienen un técnico."
              iconClasses="bg-rose-50 text-rose-700"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Baja certeza abiertas"
              value={String(metrics.lowCertaintyOpen)}
              hint="Casos abiertos con agrupación de baja certeza."
              iconClasses="bg-orange-50 text-orange-700"
            />
            <MetricCard
              icon={FileText}
              label="Reportes últimas 24 h"
              value={String(metrics.reportsLast24h)}
              hint="Reportes individuales registrados en las últimas 24 horas."
              iconClasses="bg-emerald-50 text-emerald-700"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Incidencias últimas 24 h"
              value={String(metrics.incidentsLast24h)}
              hint="Casos nuevos creados en las últimas 24 horas."
              iconClasses="bg-indigo-50 text-indigo-700"
            />
            <MetricCard
              icon={Timer}
              label="Tiempo medio a confirmar"
              value={formatMinutes(metrics.avgMinutesToConfirm)}
              hint="Desde el primer reporte hasta la confirmación del caso."
              iconClasses="bg-slate-100 text-slate-700"
            />
            <MetricCard
              icon={Clock}
              label="Tiempo medio a resolver"
              value={formatMinutes(metrics.avgMinutesToResolve)}
              hint="Desde el primer reporte hasta el evento RESUELTA."
              iconClasses="bg-teal-50 text-teal-700"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <DistributionPanel
              title="Casos por estado"
              subtitle="Todas las incidencias registradas."
              rows={statusRows}
              emptyLabel="Sin incidencias registradas."
            />
            <DistributionPanel
              title="Prioridad de casos abiertos"
              subtitle="Distribución de la prioridad calculada."
              rows={priorityRows}
              emptyLabel="No hay casos abiertos."
            />
            <DistributionPanel
              title="Tipo de falla abierta"
              subtitle="Solo casos actualmente abiertos."
              rows={failureRows}
              emptyLabel="No hay casos abiertos."
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5">
              <h2 className="text-sm font-extrabold text-slate-900">
                Sectores con mayor carga
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Top {metrics.topSectors.length} por cantidad de casos abiertos.
              </p>
            </div>

            {metrics.topSectors.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500 sm:px-5">
                No hay sectores con casos abiertos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Sector</th>
                      <th className="px-5 py-3 text-center">Casos abiertos</th>
                      <th className="px-5 py-3 text-center">Reportes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm">
                    {metrics.topSectors.map((sector) => (
                      <tr
                        key={sector.sector}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {sector.sector}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-800">
                            {sector.openIncidents}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-xs font-semibold text-slate-700">
                          {sector.reports}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/operador/bandeja"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <span>Revisar bandeja de gestión</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              to="/operador/asignacion"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <span>Asignar técnicos</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              to="/operador/reportes"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <span>Historial de reportes</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            No se pudieron obtener los indicadores.
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}
    </div>
  );
}
