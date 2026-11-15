import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Loader2 } from 'lucide-react';
import { formatFailureType } from '../../../shared/components/StatusBadge';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type { FailureType } from '../../../shared/types/domain.types';
import { customerService } from '../services/customer.service';
import { addMyReport } from '../services/myReports.registry';
import type { CreateReportRequest } from '../types/customer.types';

const FAILURE_TYPE_OPTIONS: FailureType[] = [
  'CORTE_TOTAL',
  'BAJA_TENSION',
  'INTERMITENCIA',
  'MEDIDOR',
  'ALUMBRADO_PUBLICO',
  'OTRO',
];

type FieldErrors = Partial<
  Record<
    'description' | 'sector' | 'reference' | 'latitude' | 'longitude' | 'reportedAt',
    string
  >
>;

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseOptionalNumber(value: string): number | undefined | null {
  const clean = value.trim();
  if (!clean) return undefined;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

export function NewReportForm() {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const [failureType, setFailureType] = useState<FailureType>('CORTE_TOTAL');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [reference, setReference] = useState('');
  const [reportedAt, setReportedAt] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): CreateReportRequest | null => {
    const nextErrors: FieldErrors = {};
    const cleanDescription = description.trim();
    const cleanSector = sector.trim();
    const cleanReference = reference.trim();

    if (!cleanDescription) {
      nextErrors.description = 'Describa el problema que está experimentando.';
    } else if (cleanDescription.length > 1000) {
      nextErrors.description = 'La descripción admite como máximo 1000 caracteres.';
    }

    if (cleanSector.length > 120) {
      nextErrors.sector = 'El sector admite como máximo 120 caracteres.';
    }
    if (cleanReference.length > 200) {
      nextErrors.reference = 'La referencia admite como máximo 200 caracteres.';
    }

    const parsedLatitude = parseOptionalNumber(latitude);
    if (parsedLatitude === null) {
      nextErrors.latitude = 'Ingrese un número válido.';
    } else if (
      parsedLatitude !== undefined &&
      (parsedLatitude < -90 || parsedLatitude > 90)
    ) {
      nextErrors.latitude = 'La latitud debe estar entre -90 y 90.';
    }

    const parsedLongitude = parseOptionalNumber(longitude);
    if (parsedLongitude === null) {
      nextErrors.longitude = 'Ingrese un número válido.';
    } else if (
      parsedLongitude !== undefined &&
      (parsedLongitude < -180 || parsedLongitude > 180)
    ) {
      nextErrors.longitude = 'La longitud debe estar entre -180 y 180.';
    }

    const latitudeValue =
      parsedLatitude === null ? undefined : parsedLatitude;
    const longitudeValue =
      parsedLongitude === null ? undefined : parsedLongitude;

    let reportedAtIso: string | undefined;
    if (reportedAt) {
      const parsedDate = new Date(reportedAt);
      if (Number.isNaN(parsedDate.getTime())) {
        nextErrors.reportedAt = 'Ingrese una fecha y hora válidas.';
      } else if (parsedDate.getTime() > Date.now() + 5 * 60 * 1000) {
        nextErrors.reportedAt =
          'La fecha del problema no puede estar más de 5 minutos en el futuro.';
      } else {
        reportedAtIso = parsedDate.toISOString();
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      ...(user?.id ? { clientId: user.id.slice(0, 64) } : {}),
      ...(cleanSector ? { sector: cleanSector } : {}),
      ...(cleanReference ? { reference: cleanReference } : {}),
      failureType,
      description: cleanDescription,
      ...(latitudeValue !== undefined ? { latitude: latitudeValue } : {}),
      ...(longitudeValue !== undefined ? { longitude: longitudeValue } : {}),
      ...(reportedAtIso ? { reportedAt: reportedAtIso } : {}),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const request = validate();
    if (!request) return;

    setIsSubmitting(true);
    try {
      const response = await customerService.createReport(request);
      addMyReport(response.report.id);
      success('Incidencia registrada', response.clientMessage);
      navigate(`/cliente/reportes/${response.report.id}`, { replace: true });
    } catch (err) {
      notifyError(
        'No se pudo registrar la incidencia',
        extractApiErrorMessage(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
  const labelClass =
    'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500';

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      noValidate
    >
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
        <FilePlus2 className="h-5 w-5 text-blue-600" />
        <div>
          <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
            Registrar nueva incidencia
          </h1>
          <p className="text-xs text-slate-500">
            Los campos marcados con (*) son obligatorios.
          </p>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5 sm:px-6">
        <div>
          <label htmlFor="failureType" className={labelClass}>
            Tipo de falla *
          </label>
          <select
            id="failureType"
            value={failureType}
            onChange={(event) => setFailureType(event.target.value as FailureType)}
            className={inputClass}
          >
            {FAILURE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatFailureType(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Descripción del problema *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            rows={4}
            maxLength={1000}
            placeholder="Ej. No hay luz en toda la cuadra desde hace 20 minutos."
            className={`${inputClass} resize-none`}
            aria-invalid={Boolean(errors.description)}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            {errors.description ? (
              <p className="text-xs font-semibold text-rose-600">
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="text-[10px] text-slate-400">
              {description.trim().length}/1000
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sector" className={labelClass}>
              Sector o distrito
            </label>
            <input
              id="sector"
              type="text"
              value={sector}
              onChange={(event) => {
                setSector(event.target.value);
                setErrors((prev) => ({ ...prev, sector: undefined }));
              }}
              maxLength={120}
              placeholder="Ej. San Isidro"
              className={inputClass}
            />
            {errors.sector && (
              <p className="mt-1 text-xs font-semibold text-rose-600">
                {errors.sector}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reference" className={labelClass}>
              Referencia de ubicación
            </label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(event) => {
                setReference(event.target.value);
                setErrors((prev) => ({ ...prev, reference: undefined }));
              }}
              maxLength={200}
              placeholder="Ej. Av. Arequipa 1234"
              className={inputClass}
            />
            {errors.reference && (
              <p className="mt-1 text-xs font-semibold text-rose-600">
                {errors.reference}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="reportedAt" className={labelClass}>
            Fecha y hora del problema
          </label>
          <input
            id="reportedAt"
            type="datetime-local"
            value={reportedAt}
            max={toLocalInputValue(new Date())}
            onChange={(event) => {
              setReportedAt(event.target.value);
              setErrors((prev) => ({ ...prev, reportedAt: undefined }));
            }}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Si no se indica, el sistema usa la fecha y hora de registro.
          </p>
          {errors.reportedAt && (
            <p className="mt-1 text-xs font-semibold text-rose-600">
              {errors.reportedAt}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Coordenadas (opcional)
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="latitude" className={labelClass}>
                Latitud
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                onChange={(event) => {
                  setLatitude(event.target.value);
                  setErrors((prev) => ({ ...prev, latitude: undefined }));
                }}
                placeholder="-12.0975"
                className={inputClass}
              />
              {errors.latitude && (
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  {errors.latitude}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="longitude" className={labelClass}>
                Longitud
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                onChange={(event) => {
                  setLongitude(event.target.value);
                  setErrors((prev) => ({ ...prev, longitude: undefined }));
                }}
                placeholder="-77.0365"
                className={inputClass}
              />
              {errors.longitude && (
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  {errors.longitude}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-[#F8FAFC] px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/cliente/panel')}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B132B] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FilePlus2 className="h-4 w-4" />
          )}
          <span>{isSubmitting ? 'Enviando...' : 'Enviar reporte'}</span>
        </button>
      </div>
    </form>
  );
}
