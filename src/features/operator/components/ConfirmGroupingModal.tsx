import { useState } from 'react';
import { ActionModal } from '../../../shared/components/ActionModal';
import {
  StatusBadge,
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import type { IncidentSummary } from '../types/operator.types';
import type { ReportView } from '../../../shared/types/domain.types';

interface ConfirmGroupingModalProps {
  open: boolean;
  incident: IncidentSummary | null;
  reports: ReportView[];
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (note?: string) => void;
}

export function ConfirmGroupingModal({
  open,
  incident,
  reports,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmGroupingModalProps) {
  const [note, setNote] = useState('');

  if (!incident) return null;

  const isLowCertainty =
    incident.certainty === 'BAJA' || incident.requiresReview;

  return (
    <ActionModal
      open={open}
      title="Confirmar agrupación"
      description="Al confirmar, el caso pasa a CONFIRMADA y los reportes vinculados quedan como CONFIRMADOS. Esta acción queda registrada en el historial."
      confirmLabel="Confirmar agrupación"
      isSubmitting={isSubmitting}
      noteLabel="Nota del operador (opcional)"
      notePlaceholder="Ej. Agrupación verificada con los reportes de la cuadra 18."
      noteValue={note}
      onNoteChange={setNote}
      onCancel={onCancel}
      onConfirm={() => onConfirm(note.trim() ? note.trim() : undefined)}
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {formatShortId(incident.id)}
            </span>
            <StatusBadge variant="status" value={incident.status} />
            <StatusBadge variant="certainty" value={incident.certainty} />
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            {incident.sector} · {formatFailureType(incident.failureType)} ·{' '}
            {incident.reportCount} reporte(s)
          </p>
        </div>

        {isLowCertainty && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-relaxed text-amber-900">
            Este caso está marcado como Baja Certeza o requiere revisión. Revise
            cada reporte antes de confirmar la agrupación.
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Reportes incluidos
          </p>
          <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[11px]"
              >
                <span className="truncate text-slate-700">
                  {report.reference ?? report.sector ?? 'Sin referencia'}
                </span>
                <StatusBadge variant="linkStatus" value={report.linkStatus} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ActionModal>
  );
}
