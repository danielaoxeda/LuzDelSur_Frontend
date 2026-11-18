import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import type {
  Certainty,
  FailureType,
  IncidentStatus,
  LinkAction,
  PriorityLabel,
  ReportLinkStatus,
} from '../../features/technician/types/technician.types';

type BadgeVariant = 'status' | 'priority' | 'certainty' | 'linkStatus';

interface StatusBadgeProps {
  variant: BadgeVariant;
  value: IncidentStatus | PriorityLabel | Certainty | ReportLinkStatus;
}

const STATUS_STYLES: Record<IncidentStatus, { label: string; classes: string }> = {
  SUGERIDA: {
    label: 'SUGERIDA',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  CONFIRMADA: {
    label: 'CONFIRMADA',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  EN_ATENCION: {
    label: 'EN ATENCIÓN',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  RESUELTA: {
    label: 'RESUELTA',
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  CERRADA: {
    label: 'CERRADA',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REABIERTA: {
    label: 'REABIERTA',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  DESCARTADA: {
    label: 'DESCARTADA',
    classes: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

const PRIORITY_STYLES: Record<PriorityLabel, { label: string; classes: string }> = {
  CRITICA: {
    label: 'CRÍTICA',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  ALTA: {
    label: 'ALTA',
    classes: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  MEDIA: {
    label: 'MEDIA',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  BAJA: {
    label: 'BAJA',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const CERTAINTY_STYLES: Record<Certainty, { label: string; classes: string }> = {
  ALTA: {
    label: 'CERTEZA ALTA',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  MEDIA: {
    label: 'CERTEZA MEDIA',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  BAJA: {
    label: 'CERTEZA BAJA',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const LINK_STATUS_STYLES: Record<ReportLinkStatus, { label: string; classes: string }> = {
  SUGERIDO: {
    label: 'SUGERIDO',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  CONFIRMADO: {
    label: 'CONFIRMADO',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  SEPARADO: {
    label: 'SEPARADO',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  REASIGNADO: {
    label: 'REASIGNADO',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

const FAILURE_TYPE_LABELS: Record<FailureType, string> = {
  CORTE_TOTAL: 'Corte Total',
  BAJA_TENSION: 'Baja Tensión',
  INTERMITENCIA: 'Intermitencia',
  MEDIDOR: 'Medidor',
  ALUMBRADO_PUBLICO: 'Alumbrado Público',
  OTRO: 'Otro',
};

const LINK_ACTION_LABELS: Record<LinkAction, string> = {
  VINCULADO: 'Vinculado',
  CONFIRMADO: 'Confirmado',
  SEPARADO: 'Separado',
  REASIGNADO: 'Reasignado',
  REABIERTO: 'Reabierto',
};

// eslint-disable-next-line react-refresh/only-export-components
export function formatFailureType(type: FailureType): string {
  return FAILURE_TYPE_LABELS[type] ?? type;
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatLinkAction(action: LinkAction): string {
  return LINK_ACTION_LABELS[action] ?? action;
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatIncidentStatus(status: IncidentStatus): string {
  return STATUS_STYLES[status]?.label ?? status;
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatPriorityLabel(priority: PriorityLabel): string {
  return PRIORITY_STYLES[priority]?.label ?? priority;
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatShortId(uuid: string): string {
  if (!uuid) return '—';
  return `#INC-${uuid.slice(0, 8).toUpperCase()}`;
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatReportShortId(uuid: string): string {
  if (!uuid) return '—';
  return `#REP-${uuid.slice(0, 8).toUpperCase()}`;
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function StatusBadge({ variant, value }: StatusBadgeProps) {
  if (variant === 'priority') {
    const config = PRIORITY_STYLES[value as PriorityLabel] ?? {
      label: String(value),
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    const isCritical = value === 'CRITICA' || value === 'ALTA';
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${config.classes}`}
      >
        {isCritical ? (
          <AlertTriangle className="h-3 w-3 shrink-0" />
        ) : (
          <Clock className="h-3 w-3 shrink-0" />
        )}
        {config.label}
      </span>
    );
  }

  if (variant === 'certainty') {
    const config = CERTAINTY_STYLES[value as Certainty] ?? {
      label: String(value),
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${config.classes}`}
      >
        <ShieldCheck className="h-3 w-3 shrink-0" />
        {config.label}
      </span>
    );
  }

  if (variant === 'linkStatus') {
    const config = LINK_STATUS_STYLES[value as ReportLinkStatus] ?? {
      label: String(value),
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${config.classes}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {config.label}
      </span>
    );
  }

  const config = STATUS_STYLES[value as IncidentStatus] ?? {
    label: String(value),
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${config.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
