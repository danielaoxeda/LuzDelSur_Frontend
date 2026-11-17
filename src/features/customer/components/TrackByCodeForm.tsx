import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Consulta puntual con el endpoint real GET /api/v1/reports/{reportId}.
 * El backend identifica el reporte por UUID.
 */
export function TrackByCodeForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = code.trim();

    if (!clean) {
      setError('Ingrese el código de su reporte.');
      return;
    }
    if (!UUID_PATTERN.test(clean)) {
      setError(
        'El código debe tener el formato UUID (por ejemplo: 0dfb1043-00ad-47db-bca4-8792d28ebc82).'
      );
      return;
    }

    setError(null);
    navigate(`/cliente/reportes/${clean}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2 className="text-sm font-extrabold text-slate-900">
        Consultar por código de reporte
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Use el código UUID que el sistema le entregó al registrar la incidencia.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
          }}
          placeholder="0dfb1043-00ad-47db-bca4-8792d28ebc82"
          aria-label="Código de reporte"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0B132B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Consultar</span>
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </form>
  );
}
