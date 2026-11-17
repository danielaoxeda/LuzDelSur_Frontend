import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ActionModal } from '../../../shared/components/ActionModal';
import {
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type { ReportView } from '../../../shared/types/domain.types';
import { operatorService } from '../services/operator.service';
import type { IncidentSummary } from '../types/operator.types';

interface ReassignReportModalProps {
  open: boolean;
  report: ReportView | null;
  currentIncidentId: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (targetIncidentId: string, note?: string) => void;
}

export function ReassignReportModal({
  open,
  report,
  currentIncidentId,
  isSubmitting,
  onCancel,
  onConfirm,
}: ReassignReportModalProps) {
  const [targets, setTargets] = useState<IncidentSummary[]>([]);
  const [targetId, setTargetId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    operatorService
      .getReassignTargets(currentIncidentId)
      .then((list) => {
        if (!active) return;
        setTargets(list);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setTargets([]);
        setLoadError(
          extractApiErrorMessage(
            err,
            'No se pudieron cargar las incidencias abiertas.'
          )
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentIncidentId, reloadKey]);

  if (!report) return null;

  return (
    <ActionModal
      open={open}
      title="Reasignar reporte a otra incidencia"
      description="Solo se listan casos abiertos distintos del caso actual. El backend valida la operación y calcula la certeza resultante."
      confirmLabel="Reasignar reporte"
      isSubmitting={isSubmitting}
      confirmDisabled={!targetId}
      noteLabel="Nota del operador (opcional)"
      notePlaceholder="Ej. El reporte corresponde al caso de la cuadra contigua."
      noteValue={note}
      onNoteChange={setNote}
      onCancel={onCancel}
      onConfirm={() =>
        onConfirm(targetId, note.trim() ? note.trim() : undefined)
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

        <div>
          <label
            htmlFor="reassign-target"
            className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Incidencia destino
          </label>

          {loading ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando incidencias abiertas...</span>
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-semibold text-rose-800">{loadError}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setReloadKey((value) => value + 1);
                }}
                className="mt-2 rounded-md border border-rose-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
              >
                Reintentar
              </button>
            </div>
          ) : targets.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
              No hay otras incidencias abiertas disponibles para reasignar.
            </p>
          ) : (
            <select
              id="reassign-target"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Seleccione una incidencia destino</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {formatShortId(target.id)} · {target.sector} ·{' '}
                  {formatFailureType(target.failureType)} · {target.reportCount}{' '}
                  reporte(s)
                </option>
              ))}
            </select>
          )}
          {!loading && !loadError && targets.length > 0 && (
            <p className="mt-1 text-[10px] text-slate-400">
              Se muestran hasta 50 casos abiertos, el máximo que admite la API
              por consulta.
            </p>
          )}
        </div>
      </div>
    </ActionModal>
  );
}
