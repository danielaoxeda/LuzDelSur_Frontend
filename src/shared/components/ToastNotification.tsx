import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const STYLES: Record<
  ToastType,
  { container: string; iconColor: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: 'border-emerald-200 bg-white text-slate-900',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    container: 'border-rose-200 bg-white text-slate-900',
    iconColor: 'text-rose-600',
    Icon: AlertCircle,
  },
  warning: {
    container: 'border-amber-200 bg-white text-slate-900',
    iconColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
  info: {
    container: 'border-slate-200 bg-white text-slate-900',
    iconColor: 'text-blue-600',
    Icon: Info,
  },
};

export function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => {
        const { container, iconColor, Icon } = STYLES[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/5 transition-all ${container}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar notificación"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
