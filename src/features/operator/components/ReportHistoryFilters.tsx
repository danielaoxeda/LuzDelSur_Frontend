import { Filter, RotateCcw, Search } from 'lucide-react';
import { formatFailureType } from '../../../shared/components/StatusBadge';
import type {
  FailureType,
  ReportLinkStatus,
} from '../../../shared/types/domain.types';
import type { ReportFilterValues } from '../types/report-filters.types';

const LINK_STATUS_OPTIONS: ReportLinkStatus[] = [
  'SUGERIDO',
  'CONFIRMADO',
  'SEPARADO',
  'REASIGNADO',
];

const FAILURE_OPTIONS: FailureType[] = [
  'CORTE_TOTAL',
  'BAJA_TENSION',
  'INTERMITENCIA',
  'MEDIDOR',
  'ALUMBRADO_PUBLICO',
  'OTRO',
];

interface ReportHistoryFiltersProps {
  values: ReportFilterValues;
  onChange: (patch: Partial<ReportFilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export function ReportHistoryFilters({
  values,
  onChange,
  onApply,
  onClear,
  isLoading,
}: ReportHistoryFiltersProps) {
  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
  const labelClass =
    'mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-blue-600" />
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          Filtros del historial
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label htmlFor="report-filter-incident" className={labelClass}>
            Caso
          </label>
          <input
            id="report-filter-incident"
            type="text"
            value={values.incidentId}
            onChange={(event) => onChange({ incidentId: event.target.value })}
            placeholder="UUID del caso"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="report-filter-link" className={labelClass}>
            Vínculo
          </label>
          <select
            id="report-filter-link"
            value={values.linkStatus}
            onChange={(event) =>
              onChange({
                linkStatus: event.target.value as ReportLinkStatus | '',
              })
            }
            className={inputClass}
          >
            <option value="">Todos</option>
            {LINK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-filter-failure" className={labelClass}>
            Tipo de falla
          </label>
          <select
            id="report-filter-failure"
            value={values.failureType}
            onChange={(event) =>
              onChange({
                failureType: event.target.value as FailureType | '',
              })
            }
            className={inputClass}
          >
            <option value="">Todos</option>
            {FAILURE_OPTIONS.map((failure) => (
              <option key={failure} value={failure}>
                {formatFailureType(failure)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-filter-sector" className={labelClass}>
            Sector
          </label>
          <input
            id="report-filter-sector"
            type="text"
            value={values.sector}
            onChange={(event) => onChange({ sector: event.target.value })}
            placeholder="Ej. San Isidro"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="report-filter-from" className={labelClass}>
            Desde
          </label>
          <input
            id="report-filter-from"
            type="date"
            value={values.from}
            onChange={(event) => onChange({ from: event.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="report-filter-to" className={labelClass}>
            Hasta
          </label>
          <input
            id="report-filter-to"
            type="date"
            value={values.to}
            onChange={(event) => onChange({ to: event.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] text-slate-500">
          Las fechas se envían al backend como instantes ISO (desde 00:00 hasta
          23:59 de Lima).
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar</span>
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Aplicar filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
}
