import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { formatDateTime } from '../../../shared/components/StatusBadge';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { customerService } from '../services/customer.service';
import type { TrackingResponse } from '../types/customer.types';

const LABELS = ['Muy mala', 'Mala', 'Regular', 'Buena', 'Muy buena'];

interface RateServiceCardProps {
  reportId: string;
  tracking: TrackingResponse;
  onRated: (updated: TrackingResponse) => void;
}

/**
 * Calificacion de la atencion: POST /api/v1/reports/{id}/feedback.
 * Se muestra solo si el backend indica canRate (caso resuelto o cerrado y sin
 * calificacion previa) o si ya existe una calificacion para mostrarla.
 */
export function RateServiceCard({ reportId, tracking, onRated }: RateServiceCardProps) {
  const { success, error: notifyError } = useNotification();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (tracking.feedback) {
    const given = tracking.feedback;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-900">Su calificación</p>
        <div className="mt-2 flex items-center gap-1" aria-label={`${given.rating} de 5`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              className={`h-5 w-5 ${value <= given.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          ))}
          <span className="ml-2 text-xs font-semibold text-slate-600">{LABELS[given.rating - 1]}</span>
        </div>
        {given.comment && <p className="mt-2 text-xs text-slate-600">“{given.comment}”</p>}
        <p className="mt-1 text-[11px] text-slate-400">Registrada el {formatDateTime(given.createdAt)}</p>
      </div>
    );
  }

  if (!tracking.canRate) return null;

  const handleSubmit = async () => {
    if (rating < 1 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await customerService.rateService(reportId, {
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
      success('Gracias por su calificación', 'Su opinión ayuda a mejorar la atención.');
      onRated(updated);
    } catch (err) {
      notifyError('No se pudo registrar la calificación', extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const shown = hover || rating;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-900">¿Cómo fue la atención?</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Califique la solución de su incidencia. Si la falla continúa, use «La falla persiste».
      </p>

      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            aria-label={`${value} de 5: ${LABELS[value - 1]}`}
            aria-pressed={rating === value}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${value <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          </button>
        ))}
        {shown > 0 && (
          <span className="ml-2 text-xs font-semibold text-slate-600">{LABELS[shown - 1]}</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Comentario (opcional)"
        className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B132B] focus:bg-white focus:outline-none"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={rating < 1 || isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>Enviar calificación</span>
        </button>
      </div>
    </div>
  );
}
