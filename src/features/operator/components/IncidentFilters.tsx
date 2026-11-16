import { Filter, RotateCcw, Search } from 'lucide-react';
import { formatFailureType } from '../../../shared/components/StatusBadge';
import type {
  Certainty,
  FailureType,
  IncidentStatus,
} from '../../../shared/types/domain.types';
import type { InboxFilterValues } from '../types/inbox-filters.types';

const STATUS_OPTIONS: IncidentStatus[] = [
  'SUGERIDA',
  'CONFIRMADA',
  'EN_ATENCION',
  'RESUELTA',
  'CERRADA',
  'REABIERTA',
  'DESCARTADA',
];

const CERTAINTY_OPTIONS: Certainty[] = ['ALTA', 'MEDIA', 'BAJA'];

const FAILURE_OPTIONS: FailureType[] = [
  'CORTE_TOTAL',
  'BAJA_TENSION',
  'INTERMITENCIA',
  'MEDIDOR',
  'ALUMBRADO_PUBLICO',
  'OTRO',
];

interface IncidentFiltersProps {
  values: InboxFilterValues;
  onChange: (patch: Partial<InboxFilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export function IncidentFilters({
  values,
  onChange,
  onApply,
  onClear,
  isLoading,
}: IncidentFiltersProps) {
  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-blue-600" />
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          Filtros de bandeja
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label
            htmlFor="filter-status"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Estado
          </label>
          <select
            id="filter-status"
            value={values.status}
            onChange={(event) =>
              onChange({ status: event.target.value as IncidentStatus | '' })
            }
            className={selectClass}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-certainty"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Certeza
          </label>
          <select
            id="filter-certainty"
            value={values.certainty}
            onChange={(event) =>
              onChange({ certainty: event.target.value as Certainty | '' })
            }
            className={selectClass}
          >
            <option value="">Todas</option>
            {CERTAINTY_OPTIONS.map((certainty) => (
              <option key={certainty} value={certainty}>
                {certainty}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-review"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Revisión
          </label>
          <select
            id="filter-review"
            value={values.requiresReview}
            onChange={(event) =>
              onChange({
                requiresReview: event.target.value as '' | 'true' | 'false',
              })
            }
            className={selectClass}
          >
            <option value="">Todas</option>
            <option value="true">Requiere revisión</option>
            <option value="false">Sin revisión</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-failure"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Tipo de falla
          </label>
          <select
            id="filter-failure"
            value={values.failureType}
            onChange={(event) =>
              onChange({ failureType: event.target.value as FailureType | '' })
            }
            className={selectClass}
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
          <label
            htmlFor="filter-sector"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Sector
          </label>
          <input
            id="filter-sector"
            type="text"
            value={values.sector}
            onChange={(event) => onChange({ sector: event.target.value })}
            placeholder="Ej. San Isidro"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={values.onlyOpen}
            onChange={(event) => onChange({ onlyOpen: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Solo casos abiertos
        </label>

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
