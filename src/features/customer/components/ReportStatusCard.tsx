import { AlertTriangle, Info, Radio } from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import type { TrackingResponse } from '../types/customer.types';

interface ReportStatusCardProps {
  tracking: TrackingResponse;
}

/**
 * Presenta el estado comprensible que devuelve el backend.
 * El mensaje del cliente se muestra literal: esta redactado para no prometer
 * una resolucion que el sistema aun no puede garantizar.
 */
export function ReportStatusCard({ tracking }: ReportStatusCardProps) {
  const { report, incidentStatus, certainty, requiresReview, clientMessage } =
    tracking;

  const isLowCertainty = certainty === 'BAJA' || requiresReview;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              Mensaje del sistema
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">
              {clientMessage}
            </p>
          </div>
        </div>
      </div>

      {isLowCertainty && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-xs font-bold text-amber-900">
              Caso en revisión por el operador
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              La coincidencia con otros reportes no es concluyente. Un operador
              debe validar la agrupación antes de confirmarla.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {incidentStatus ? (
            <StatusBadge variant="status" value={incidentStatus} />
          ) : (
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              SIN CASO VINCULADO
            </span>
          )}
          {certainty && <StatusBadge variant="certainty" value={certainty} />}
          <StatusBadge variant="linkStatus" value={report.linkStatus} />
        </div>

        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Código de reporte
            </dt>
            <dd className="mt-0.5 font-mono text-[11px] font-semibold text-slate-900">
              {report.id}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Caso vinculado
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {tracking.incidentId ? formatShortId(tracking.incidentId) : '—'}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Última actualización
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(tracking.incidentUpdatedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Reportado
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(report.reportedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-900">
            Datos del reporte
          </h2>
        </div>

        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Sector
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {report.sector ?? 'No informado'}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Referencia
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {report.reference ?? 'No informada'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Descripción
            </dt>
            <dd className="mt-0.5 whitespace-pre-line text-sm text-slate-800">
              {report.description}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Motivo de vinculación
            </dt>
            <dd className="mt-0.5 text-sm text-slate-800">
              {report.groupingReason ?? 'Información pendiente de cargar'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
