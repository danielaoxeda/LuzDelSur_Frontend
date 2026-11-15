import { useState } from 'react';
import { ActionModal } from '../../../shared/components/ActionModal';
import { formatShortId } from '../../../shared/components/StatusBadge';
import type { ReportView } from '../../../shared/types/domain.types';

interface SeparateReportModalProps {
  open: boolean;
  report: ReportView | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (createNewIncident: boolean, note?: string) => void;
}

export function SeparateReportModal({
  open,
  report,
  isSubmitting,
  onCancel,
  onConfirm,
}: SeparateReportModalProps) {
  const [createNewIncident, setCreateNewIncident] = useState(true);
  const [note, setNote] = useState('');

  if (!report) return null;

  return (
    <ActionModal
      open={open}
      title="Separar reporte de la agrupación"
      description="El reporte conserva siempre su UUID original y el historial del vínculo."
      confirmLabel="Separar reporte"
      tone="danger"
      isSubmitting={isSubmitting}
      noteLabel="Motivo de la separación (opcional)"
      notePlaceholder="Ej. El reporte corresponde a una falla distinta."
      noteValue={note}
      onNoteChange={setNote}
      onCancel={onCancel}
      onConfirm={() =>
        onConfirm(createNewIncident, note.trim() ? note.trim() : undefined)
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
          <p className="text-xs font-bold text-slate-900">
            {formatShortId(report.id)} · {report.reference ?? 'Sin referencia'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {report.description}
          </p>
        </div>

        <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3">
          <input
            type="checkbox"
            checked={createNewIncident}
            onChange={(event) => setCreateNewIncident(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs leading-relaxed text-slate-700">
            Crear una nueva incidencia con este reporte.
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Si se desmarca, el reporte queda separado sin caso vinculado. Si el
              caso de origen queda sin reportes, el backend lo marca como
              DESCARTADA.
            </span>
          </span>
        </label>
      </div>
    </ActionModal>
  );
}
