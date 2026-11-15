import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ActionModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  isSubmitting?: boolean;
  confirmDisabled?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  noteValue?: string;
  onNoteChange?: (value: string) => void;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Modal de accion reutilizable. El campo de nota respeta el limite de 500
 * caracteres que validan los DTO de Spring Boot.
 */
export function ActionModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'primary',
  isSubmitting = false,
  confirmDisabled = false,
  noteLabel,
  notePlaceholder,
  noteValue,
  onNoteChange,
  children,
  onCancel,
  onConfirm,
}: ActionModalProps) {
  if (!open) return null;

  const confirmClasses =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700'
      : 'bg-[#0B132B] hover:bg-slate-900';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-4"
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {description && (
          <div className="mt-2 text-xs leading-relaxed text-slate-600">
            {description}
          </div>
        )}

        {children && <div className="mt-4">{children}</div>}

        {onNoteChange !== undefined && (
          <div className="mt-4">
            <label
              htmlFor="action-modal-note"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              {noteLabel ?? 'Nota (opcional)'}
            </label>
            <textarea
              id="action-modal-note"
              value={noteValue ?? ''}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder={notePlaceholder}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-right text-[10px] text-slate-400">
              {(noteValue ?? '').length}/500
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || confirmDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${confirmClasses}`}
          >
            {isSubmitting && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
