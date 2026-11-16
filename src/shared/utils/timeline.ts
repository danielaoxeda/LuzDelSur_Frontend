import {
  formatIncidentStatus,
  formatLinkAction,
  formatShortId,
} from '../components/StatusBadge';
import type { LinkAction, StatusEventView } from '../types/domain.types';

/** Entrada minima de report_link_history que necesita la linea de tiempo. */
interface LinkEntry {
  id: number;
  reportId: string;
  action: LinkAction;
  actorId: string | null;
  actorName?: string | null;
  note: string | null;
  createdAt: string;
}

export interface TimelineRow {
  key: string;
  kind: 'ESTADO' | 'VINCULO';
  action: string;
  actor: string;
  note: string | null;
  createdAt: string;
}

function actorLabel(name?: string | null, id?: string | null): string {
  if (name) return name;
  if (!id) return 'Sistema';
  if (id === 'anonimo') return 'Cliente (sin sesión)';
  return id;
}

/**
 * Une los eventos de estado (statusHistory) y los vinculos de reportes
 * (history) en una sola linea de tiempo, de la mas antigua a la mas reciente.
 */
export function buildTimeline(
  history: LinkEntry[],
  statusHistory: StatusEventView[] = []
): TimelineRow[] {
  const statusRows: TimelineRow[] = statusHistory.map((event) => ({
    key: `estado-${event.id}`,
    kind: 'ESTADO',
    action:
      event.eventType === 'ASIGNACION'
        ? 'Asignación de técnico'
        : event.fromStatus
          ? `${formatIncidentStatus(event.fromStatus)} → ${formatIncidentStatus(event.toStatus)}`
          : formatIncidentStatus(event.toStatus),
    actor: actorLabel(event.actorName, event.actorId),
    note: event.note,
    createdAt: event.createdAt,
  }));

  const linkRows: TimelineRow[] = history.map((entry) => ({
    key: `vinculo-${entry.id}`,
    kind: 'VINCULO',
    action: `${formatLinkAction(entry.action)} · ${formatShortId(entry.reportId)}`,
    actor: actorLabel(entry.actorName, entry.actorId),
    note: entry.note,
    createdAt: entry.createdAt,
  }));

  return [...statusRows, ...linkRows].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
