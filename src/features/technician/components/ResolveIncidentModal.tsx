import { useState, type FormEvent } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  formatFailureType,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import type { IncidentSummary } from '../types/technician.types';

interface ResolveIncidentModalProps {
  incident: IncidentSummary | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirmResolve: (incidentId: string, note: string) => Promise<void>;
}

export function ResolveIncidentModal({
  incident,
  isSubmitting,
  onClose,
  onConfirmResolve,
}: ResolveIncidentModalProps) {
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!incident) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (note.length > 500) {
      setValidationError('La nota no puede superar los 500 caracteres.');
      return;
    }
    setValidationError(null);
    await onConfirmResolve(incident.id, note);
    setNote('');
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-modal-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="resolve-modal-title"
              className="text-base font-extrabold text-slate-900"
            >
              Registrar Resolución ({formatShortId(incident.id)})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Confirmación de restablecimiento del servicio eléctrico en campo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold text-slate-400">SECTOR:</span>{' '}
                <span className="font-bold text-slate-800">{incident.sector}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">FALLA:</span>{' '}
                <span className="font-bold text-slate-800">
                  {formatFailureType(incident.failureType)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-400">
                  REPORTES VINCULADOS:
                </span>{' '}
                <span className="font-bold text-slate-800">
                  {incident.reportCount}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="resolve-note"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Observación técnica de resolución
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {note.length} / 500
              </span>
            </div>
            <textarea
              id="resolve-note"
              rows={4}
              maxLength={500}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Ej. Suministro restablecido tras reposición de elemento fusible en el sector."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B132B] focus:bg-white focus:outline-none"
            />
          </div>

          {validationError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isSubmitting ? 'Guardando...' : 'Confirmar Resolución'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
