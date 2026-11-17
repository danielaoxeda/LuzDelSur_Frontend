import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ActionModal } from '../../../shared/components/ActionModal';
import { formatShortId } from '../../../shared/components/StatusBadge';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { operatorService } from '../services/operator.service';
import type { IncidentSummary, TechnicianOption } from '../types/operator.types';

interface AssignTechnicianModalProps {
  incident: IncidentSummary;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (technicianId: string, note?: string) => void;
}

/**
 * Asignacion manual: POST /api/v1/operator/incidents/{id}/assign.
 * Los candidatos salen de GET /api/v1/operator/technicians?onlyActive=true,
 * con su carga de casos abiertos para repartir el trabajo.
 */
export function AssignTechnicianModal({
  incident,
  isSubmitting,
  onCancel,
  onConfirm,
}: AssignTechnicianModalProps) {
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [technicianId, setTechnicianId] = useState(incident.assignedTechnicianId ?? '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    operatorService
      .getTechnicians(true)
      .then((list) => {
        if (!active) return;
        setTechnicians(list);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la lista de técnicos.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isReassignment = Boolean(incident.assignedTechnicianId);

  return (
    <ActionModal
      open
      title={isReassignment ? 'Reasignar técnico' : 'Asignar técnico'}
      description={`El caso ${formatShortId(incident.id)} aparecerá en las tareas del técnico elegido. Otro técnico no podrá iniciar ni resolver el caso.`}
      confirmLabel={isReassignment ? 'Reasignar' : 'Asignar'}
      isSubmitting={isSubmitting}
      confirmDisabled={!technicianId || technicianId === incident.assignedTechnicianId}
      noteLabel="Nota para la cuadrilla (opcional)"
      notePlaceholder="Ej. Llevar fusibles de 20 A; acceso por la calle lateral."
      noteValue={note}
      onNoteChange={setNote}
      onCancel={onCancel}
      onConfirm={() => onConfirm(technicianId, note.trim() ? note.trim() : undefined)}
    >
      <div>
        <label
          htmlFor="assign-technician"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
        >
          Técnico
        </label>
        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando técnicos...</span>
          </div>
        ) : loadError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {loadError}
          </p>
        ) : technicians.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
            No hay técnicos activos registrados.
          </p>
        ) : (
          <select
            id="assign-technician"
            value={technicianId}
            onChange={(event) => setTechnicianId(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Seleccione un técnico</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name} · {technician.openAssignments} caso(s) abierto(s)
                {technician.id === incident.assignedTechnicianId ? ' · asignado actualmente' : ''}
              </option>
            ))}
          </select>
        )}
      </div>
    </ActionModal>
  );
}
