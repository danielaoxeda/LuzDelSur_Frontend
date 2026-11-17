import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BellRing,
  Loader2,
  RefreshCw,
  SearchX,
} from 'lucide-react';
import { ActionModal } from '../../../shared/components/ActionModal';
import { formatShortId } from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { RateServiceCard } from '../components/RateServiceCard';
import { ReportStatusCard } from '../components/ReportStatusCard';
import { customerService } from '../services/customer.service';
import type { TrackingResponse } from '../types/customer.types';

const PERSISTENCE_STATUSES = new Set(['RESUELTA', 'CERRADA']);

export function CustomerTrackingPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { success, error: notifyError } = useNotification();

  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [persistenceOpen, setPersistenceOpen] = useState(false);
  const [persistenceNote, setPersistenceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => {
    setLoadError(null);
    setLoading(true);
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    if (!reportId) return;
    let active = true;

    customerService
      .getTracking(reportId)
      .then((data) => {
        if (!active) return;
        setTracking(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setTracking(null);
        setLoadError(
          extractApiErrorMessage(err, 'No se pudo consultar el reporte.')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reportId, reloadKey]);

  const handlePersistence = async () => {
    if (!reportId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await customerService.reportPersistence(reportId, {
        ...(persistenceNote.trim() ? { note: persistenceNote.trim() } : {}),
      });
      setTracking(updated);
      setPersistenceOpen(false);
      setPersistenceNote('');
      success('Aviso registrado', updated.clientMessage);
    } catch (err) {
      notifyError(
        'No se pudo registrar el aviso',
        extractApiErrorMessage(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/cliente/reportes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a mis reportes</span>
        </Link>

        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div>
        <h1 className="text-lg font-extrabold text-slate-900">
          Seguimiento {reportId ? formatShortId(reportId) : ''}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Estado reportado por el sistema para su incidencia.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
          <p className="mt-2 text-xs font-medium">Consultando el reporte...</p>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <SearchX className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-2 text-sm font-bold text-slate-900">
            No se pudo consultar el reporte
          </p>
          <p className="mt-1 text-xs text-slate-600">{loadError}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
            <Link
              to="/cliente/reportes"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span>Consultar otro código</span>
            </Link>
          </div>
        </div>
      ) : tracking ? (
        <>
          <ReportStatusCard tracking={tracking} />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-900">
                ¿La falla continúa?
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Disponible cuando el caso figura como resuelto o cerrado.
              </p>
            </div>
            <button
              type="button"
              disabled={
                !tracking.incidentStatus ||
                !PERSISTENCE_STATUSES.has(tracking.incidentStatus)
              }
              onClick={() => setPersistenceOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>La falla persiste</span>
            </button>
          </div>

          {reportId && (
            <RateServiceCard reportId={reportId} tracking={tracking} onRated={setTracking} />
          )}
        </>
      ) : null}

      <ActionModal
        open={persistenceOpen}
        title="Avisar que la falla persiste"
        description="Si el caso estaba resuelto o cerrado, el backend lo reabrirá para revisión. Puede añadir una nota con lo que observa."
        confirmLabel="Enviar aviso"
        isSubmitting={isSubmitting}
        noteLabel="Nota (opcional)"
        notePlaceholder="Ej. La luz volvió a cortarse a las 20:30."
        noteValue={persistenceNote}
        onNoteChange={setPersistenceNote}
        onCancel={() => {
          if (!isSubmitting) setPersistenceOpen(false);
        }}
        onConfirm={() => void handlePersistence()}
      />
    </div>
  );
}
