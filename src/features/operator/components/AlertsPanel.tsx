import { AlertTriangle, Bell, ShieldCheck } from 'lucide-react';
import type { Certainty } from '../../../shared/types/domain.types';

interface AlertsPanelProps {
  alerts: string[];
  certainty: Certainty;
  requiresReview: boolean;
}

export function AlertsPanel({ alerts, certainty, requiresReview }: AlertsPanelProps) {
  const isLowCertainty = certainty === 'BAJA' || requiresReview;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <Bell className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-extrabold text-slate-900">
          Alertas del motor
        </h2>
      </div>

      <div className="space-y-2 p-4 sm:p-5">
        {isLowCertainty && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p className="text-xs font-semibold leading-relaxed text-rose-900">
              Baja certeza: revise los reportes vinculados antes de confirmar la
              agrupación.
            </p>
          </div>
        )}

        {alerts.length === 0 ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-900">
              El backend no reporta alertas para este caso.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert}
                className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC] p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-xs leading-relaxed text-slate-800">
                  {alert}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
