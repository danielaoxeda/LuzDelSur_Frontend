import { Link } from 'react-router-dom';
import { ArrowRight, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import {
  StatusBadge,
  formatDateTime,
  formatShortId,
} from '../../../shared/components/StatusBadge';
import { TrackByCodeForm } from '../components/TrackByCodeForm';
import { useMyReports } from '../hooks/useMyReports';

export function CustomerReportsPage() {
  const { items, loading, reload } = useMyReports();

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <div>
              <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
                Mis Reportes
              </h1>
              <p className="text-xs text-slate-500">
                Reportes registrados con su cuenta, del más reciente al más
                antiguo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <Link
              to="/cliente/nueva"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B132B] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
            >
              <span>Nueva incidencia</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#0B132B]" />
            <p className="mt-2 text-xs font-medium">
              Consultando el estado de sus reportes...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Aún no registró reportes con esta cuenta.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Si registró una incidencia sin iniciar sesión, use el código del
              reporte para consultarlo.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {items.map(({ entry, tracking, error }) => (
                <div key={entry.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900">
                        {formatShortId(entry.id)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                        {entry.id}
                      </p>
                    </div>
                    {tracking?.incidentStatus ? (
                      <StatusBadge
                        variant="status"
                        value={tracking.incidentStatus}
                      />
                    ) : (
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        NO DISPONIBLE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700">
                    {tracking
                      ? tracking.report.description
                      : (error ?? 'Estado no disponible')}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>Registrado: {formatDateTime(entry.registeredAt)}</span>
                    {tracking?.certainty && (
                      <StatusBadge variant="certainty" value={tracking.certainty} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/cliente/reportes/${entry.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                    >
                      <span>Ver seguimiento</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Código</th>
                    <th className="px-6 py-3.5">Descripción</th>
                    <th className="px-6 py-3.5">Registrado</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5">Certeza</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {items.map(({ entry, tracking, error }) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {formatShortId(entry.id)}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                          {entry.id}
                        </p>
                      </td>
                      <td className="max-w-[280px] px-6 py-4">
                        <p className="truncate text-xs text-slate-700">
                          {tracking
                            ? tracking.report.description
                            : (error ?? 'Estado no disponible')}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {tracking?.report.sector ?? 'Sector no informado'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(entry.registeredAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {tracking?.incidentStatus ? (
                          <StatusBadge
                            variant="status"
                            value={tracking.incidentStatus}
                          />
                        ) : (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            NO DISPONIBLE
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {tracking?.certainty ? (
                          <StatusBadge
                            variant="certainty"
                            value={tracking.certainty}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/cliente/reportes/${entry.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                          >
                            <span>Seguimiento</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
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

      <TrackByCodeForm />
    </div>
  );
}
