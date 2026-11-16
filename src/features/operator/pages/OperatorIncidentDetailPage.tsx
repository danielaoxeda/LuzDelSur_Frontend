import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  History,
  Loader2,
  RefreshCw,
  Scissors,
  SearchX,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { ActionModal } from '../../../shared/components/ActionModal';
import {
  StatusBadge,
  formatDateTime,
  formatFailureType,
  formatLinkAction,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type {
  IncidentStatus,
  ReportView,
} from '../../../shared/types/domain.types';
import { AlertsPanel } from '../components/AlertsPanel';
import { ConfirmGroupingModal } from '../components/ConfirmGroupingModal';
import { ReassignReportModal } from '../components/ReassignReportModal';
import { SeparateReportModal } from '../components/SeparateReportModal';
import { SimilarityIndicator } from '../components/SimilarityIndicator';
import { operatorService } from '../services/operator.service';
import type { IncidentDetail } from '../types/operator.types';

const OPEN_STATUSES = new Set<IncidentStatus>([
  'SUGERIDA',
  'CONFIRMADA',
  'EN_ATENCION',
  'REABIERTA',
]);

export function OperatorIncidentDetailPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { success, error: notifyError } = useNotification();

  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [separateReport, setSeparateReport] = useState<ReportView | null>(null);
  const [reassignReport, setReassignReport] = useState<ReportView | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = (silent = false) => {
    setLoadError(null);
    if (!silent) setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    if (!incidentId) return;
    let active = true;

    operatorService
      .getIncidentDetail(incidentId)
      .then((data) => {
        if (!active) return;
        setDetail(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          extractApiErrorMessage(err, 'No se pudo cargar la incidencia.')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [incidentId, reloadKey]);

  const handleActionError = (err: unknown, title: string) => {
    const isConflict =
      axios.isAxiosError(err) && err.response?.status === 409;
    notifyError(
      title,
      isConflict
        ? `${extractApiErrorMessage(err)} El caso pudo ser modificado por otro operador; se recargará la información.`
        : extractApiErrorMessage(err)
    );
    if (isConflict) reload(true);
  };

  const handleConfirm = async (note?: string) => {
    if (!incidentId || actionBusy) return;
    setActionBusy(true);
    try {
      const updated = await operatorService.confirmGrouping(incidentId, {
        ...(note ? { note } : {}),
      });
      setDetail(updated);
      setConfirmOpen(false);
      success(
        'Agrupación confirmada',
        `El caso ${formatShortId(incidentId)} pasó a estado CONFIRMADA.`
      );
    } catch (err) {
      handleActionError(err, 'No se pudo confirmar la agrupación');
    } finally {
      setActionBusy(false);
    }
  };

  const handleSeparate = async (createNewIncident: boolean, note?: string) => {
    if (!separateReport || actionBusy) return;
    setActionBusy(true);
    try {
      const result = await operatorService.separateReport(separateReport.id, {
        createNewIncident,
        ...(note ? { note } : {}),
      });
      setDetail(result.sourceIncident);
      setSeparateReport(null);
      success(
        'Reporte separado',
        result.newIncidentId
          ? `Se creó la incidencia ${formatShortId(result.newIncidentId)} para el reporte.`
          : 'El reporte quedó separado sin una incidencia vinculada.'
      );
    } catch (err) {
      handleActionError(err, 'No se pudo separar el reporte');
    } finally {
      setActionBusy(false);
    }
  };

  const handleReassign = async (targetIncidentId: string, note?: string) => {
    if (!reassignReport || actionBusy) return;
    setActionBusy(true);
    try {
      await operatorService.reassignReport(reassignReport.id, {
        targetIncidentId,
        ...(note ? { note } : {}),
      });
      setReassignReport(null);
      success(
        'Reporte reasignado',
        `El reporte se movió a la incidencia ${formatShortId(targetIncidentId)}.`
      );
      reload(true);
    } catch (err) {
      handleActionError(err, 'No se pudo reasignar el reporte');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCloseCase = async () => {
    if (!incidentId || actionBusy) return;
    setActionBusy(true);
    try {
      const updated = await operatorService.changeStatus(incidentId, {
        status: 'CERRADA',
        ...(closeNote.trim() ? { note: closeNote.trim() } : {}),
      });
      setDetail(updated);
      setCloseOpen(false);
      setCloseNote('');
      success(
        'Caso cerrado',
        `La incidencia ${formatShortId(incidentId)} quedó en estado CERRADA.`
      );
    } catch (err) {
      handleActionError(err, 'No se pudo cerrar el caso');
    } finally {
      setActionBusy(false);
    }
  };

  if (!incidentId) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-900">
          No se indicó una incidencia válida.
        </p>
        <Link
          to="/operador/bandeja"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la bandeja</span>
        </Link>
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
        <p className="mt-2 text-xs font-medium">Cargando el caso...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
        <SearchX className="mx-auto h-8 w-8 text-rose-500" />
        <p className="mt-2 text-sm font-bold text-slate-900">
          No se pudo cargar la incidencia
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {loadError ?? 'Información pendiente de cargar.'}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => reload()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </button>
          <Link
            to="/operador/bandeja"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la bandeja</span>
          </Link>
        </div>
      </div>
    );
  }

  const incident = detail.incident;
  const isOpen = OPEN_STATUSES.has(incident.status);
  const canConfirm = incident.status === 'SUGERIDA';
  const canClose =
    incident.status === 'RESUELTA' || incident.status === 'REABIERTA';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/operador/bandeja"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la bandeja</span>
        </Link>

        <button
          type="button"
          onClick={() => reload()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Actualizar</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-semibold leading-relaxed text-amber-900">
            No se pudo actualizar la información: {loadError}
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Incidencia
              </p>
              <h1 className="mt-0.5 text-lg font-extrabold text-slate-900">
                {formatShortId(incident.id)}
              </h1>
              <p className="mt-0.5 text-xs text-slate-600">
                {incident.sector} · {formatFailureType(incident.failureType)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant="status" value={incident.status} />
              <StatusBadge variant="certainty" value={incident.certainty} />
              <StatusBadge variant="priority" value={incident.priorityLabel} />
              <span className="text-[11px] font-semibold text-slate-500">
                score {incident.priorityScore.toFixed(1)}
              </span>
            </div>
          </div>

          {(incident.certainty === 'BAJA' || incident.requiresReview) && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p className="text-xs font-semibold leading-relaxed text-rose-900">
                Baja certeza: la agrupación requiere revisión humana antes de
                confirmarse.
              </p>
            </div>
          )}

          {(canConfirm || canClose) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {canConfirm && (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirmar agrupación</span>
                </button>
              )}
              {canClose && (
                <button
                  type="button"
                  onClick={() => {
                    setCloseNote('');
                    setCloseOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cerrar caso</span>
                </button>
              )}
            </div>
          )}
        </div>

        <dl className="grid gap-4 px-4 py-4 text-xs sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Reportes vinculados
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {incident.reportCount}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Primer reporte
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(incident.firstReportedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Último reporte
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(incident.lastReportedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Actualizado
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(incident.updatedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Confirmado por
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {incident.confirmedBy ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Fecha de confirmación
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(incident.confirmedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Cerrado
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatDateTime(incident.closedAt)}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase tracking-wider text-slate-500">
              Versión
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {incident.version}
            </dd>
          </div>
        </dl>
      </div>

      <AlertsPanel
        alerts={detail.alerts}
        certainty={incident.certainty}
        requiresReview={incident.requiresReview}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-6">
          <h2 className="text-sm font-extrabold text-slate-900">
            Reportes vinculados
          </h2>
          {!isOpen && (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              <AlertTriangle className="h-3 w-3" />
              Caso cerrado: no admite cambios de agrupación
            </span>
          )}
        </div>

        {detail.reports.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-slate-500 sm:px-6">
            El caso no tiene reportes vigentes vinculados.
          </p>
        ) : (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {detail.reports.map((report) => (
                <div key={report.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {formatShortId(report.id)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {report.reference ?? 'Sin referencia'} ·{' '}
                        {report.sector ?? 'Sector no informado'}
                      </p>
                    </div>
                    <StatusBadge variant="linkStatus" value={report.linkStatus} />
                  </div>

                  <p className="text-xs leading-relaxed text-slate-700">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>{formatFailureType(report.failureType)}</span>
                    <span>·</span>
                    <span>{formatDateTime(report.reportedAt)}</span>
                    <span>·</span>
                    <SimilarityIndicator similarity={report.similarity} />
                  </div>

                  {report.groupingReason && (
                    <p className="rounded-md bg-[#F8FAFC] p-2 text-[11px] text-slate-600">
                      {report.groupingReason}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!isOpen || actionBusy}
                      onClick={() => setSeparateReport(report)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Scissors className="h-3.5 w-3.5" />
                      <span>Separar</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isOpen || actionBusy}
                      onClick={() => setReassignReport(report)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span>Reasignar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Reporte</th>
                    <th className="px-6 py-3.5">Ubicación</th>
                    <th className="px-6 py-3.5">Descripción</th>
                    <th className="px-6 py-3.5">Vínculo</th>
                    <th className="px-6 py-3.5">Similitud</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {detail.reports.map((report) => (
                    <tr
                      key={report.id}
                      className="align-top transition-colors hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {formatShortId(report.id)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatDateTime(report.reportedAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {report.sector ?? 'Sector no informado'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {report.reference ?? 'Sin referencia'}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {formatFailureType(report.failureType)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-[320px] whitespace-pre-line text-xs leading-relaxed text-slate-700">
                          {report.description}
                        </p>
                        {report.groupingReason && (
                          <p className="mt-1 max-w-[320px] text-[11px] leading-relaxed text-slate-500">
                            Motivo: {report.groupingReason}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge
                          variant="linkStatus"
                          value={report.linkStatus}
                        />
                        {report.certainty && (
                          <div className="mt-1">
                            <StatusBadge
                              variant="certainty"
                              value={report.certainty}
                            />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <SimilarityIndicator similarity={report.similarity} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={!isOpen || actionBusy}
                            onClick={() => setSeparateReport(report)}
                            title={
                              isOpen
                                ? 'Separar reporte'
                                : 'El caso no admite cambios de agrupación'
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Scissors className="h-3.5 w-3.5" />
                            <span>Separar</span>
                          </button>
                          <button
                            type="button"
                            disabled={!isOpen || actionBusy}
                            onClick={() => setReassignReport(report)}
                            title={
                              isOpen
                                ? 'Reasignar reporte'
                                : 'El caso no admite cambios de agrupación'
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            <span>Reasignar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3.5 sm:px-5">
          <History className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-900">
            Historial de vínculos
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {detail.history.length}
          </span>
        </div>

        {detail.history.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-slate-500">
            Sin eventos de historial registrados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {detail.history.map((entry) => (
              <li key={entry.id} className="px-4 py-3.5 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                    {formatLinkAction(entry.action)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] text-slate-600">
                  Reporte {formatShortId(entry.reportId)} ·{' '}
                  {entry.fromIncidentId
                    ? formatShortId(entry.fromIncidentId)
                    : 'sin caso'}{' '}
                  →{' '}
                  {entry.toIncidentId
                    ? formatShortId(entry.toIncidentId)
                    : 'sin caso'}
                </p>

                {entry.note && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-800">
                    {entry.note}
                  </p>
                )}

                <p className="mt-1 text-[10px] text-slate-400">
                  Actor: {entry.actorId}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmOpen && (
        <ConfirmGroupingModal
          open
          incident={detail.incident}
          reports={detail.reports}
          isSubmitting={actionBusy}
          onCancel={() => {
            if (!actionBusy) setConfirmOpen(false);
          }}
          onConfirm={(note) => void handleConfirm(note)}
        />
      )}

      {separateReport && (
        <SeparateReportModal
          open
          report={separateReport}
          isSubmitting={actionBusy}
          onCancel={() => {
            if (!actionBusy) setSeparateReport(null);
          }}
          onConfirm={(createNewIncident, note) =>
            void handleSeparate(createNewIncident, note)
          }
        />
      )}

      {reassignReport && (
        <ReassignReportModal
          open
          report={reassignReport}
          currentIncidentId={detail.incident.id}
          isSubmitting={actionBusy}
          onCancel={() => {
            if (!actionBusy) setReassignReport(null);
          }}
          onConfirm={(targetIncidentId, note) =>
            void handleReassign(targetIncidentId, note)
          }
        />
      )}

      <ActionModal
        open={closeOpen}
        title="Cerrar caso"
        description="El caso pasará a estado CERRADA. La transición solo es válida desde RESUELTA o REABIERTA y el backend la valida."
        confirmLabel="Cerrar caso"
        tone="danger"
        isSubmitting={actionBusy}
        noteLabel="Nota del operador (opcional)"
        noteValue={closeNote}
        onNoteChange={setCloseNote}
        onCancel={() => {
          if (!actionBusy) setCloseOpen(false);
        }}
        onConfirm={() => void handleCloseCase()}
      />
    </div>
  );
}
