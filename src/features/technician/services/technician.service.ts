import { api } from '../../../shared/services/api';
import { session } from '../../../shared/services/session';
import type {
  IncidentDetail,
  IncidentSummary,
  PageResponse,
  StatusRequest,
  TechnicianHistoryFilter,
  TechnicianIncidentSummary,
  TechnicianIncidentView,
  TechnicianTasksFilter,
} from '../types/technician.types';

const PAGE_SIZE = 50;

/**
 * Adapta TechnicianDtos.TechnicianIncidentSummary al IncidentSummary de las vistas.
 */
function toIncidentSummary(item: TechnicianIncidentSummary): IncidentSummary {
  return {
    id: item.id,
    sector: item.sector,
    failureType: item.failureType,
    status: item.status,
    certainty: item.certainty,
    requiresReview: item.requiresReview,
    priorityScore: item.priorityScore,
    priorityLabel: item.priorityLabel,
    reportCount: item.affectedReports,
    firstReportedAt: item.firstReportedAt,
    lastReportedAt: item.lastReportedAt,
    confirmedAt: null,
    confirmedBy: null,
    assignedTechnicianId: item.assignedTechnicianId ?? null,
    assignedAt: item.assignedAt ?? null,
    estimatedScope: item.estimatedScope,
    closedAt: item.closedAt ?? null,
    updatedAt: item.updatedAt ?? item.statusUpdatedAt ?? item.lastReportedAt,
    version: 0,
  };
}

/**
 * Servicio real del técnico conectado a TechnicianController (/api/v1/technician).
 * Siempre consulta con onlyMine=true para que cada técnico vea y gestione
 * únicamente las incidencias asignadas a él.
 */
export const technicianService = {
  /**
   * Bandeja del técnico: casos CONFIRMADA, EN_ATENCION o REABIERTA asignados al técnico autenticado.
   * GET /api/v1/technician/incidents?onlyMine=true
   */
  async getAssignedTasks(
    filters?: TechnicianTasksFilter
  ): Promise<IncidentSummary[]> {
    const { data } = await api.get<PageResponse<TechnicianIncidentSummary>>(
      '/v1/technician/incidents',
      {
        params: {
          status: filters?.status || undefined,
          sector: filters?.sector?.trim() || undefined,
          onlyMine: true,
          page: 0,
          size: PAGE_SIZE,
        },
      }
    );
    const me = session.getUser()?.id;
    return data.content
      .filter((item) => !me || item.assignedTechnicianId === me)
      .map(toIncidentSummary);
  },

  /**
   * Contexto consolidado (incidencia padre + reportes hijos vinculados).
   * GET /api/v1/technician/incidents/{incidentId}
   */
  async getConsolidatedDetail(
    incidentId: string
  ): Promise<TechnicianIncidentView> {
    const { data } = await api.get<TechnicianIncidentView>(
      `/v1/technician/incidents/${incidentId}`
    );
    return data;
  },

  /**
   * Cambia el estado de la incidencia a EN_ATENCION o RESUELTA.
   * POST /api/v1/technician/incidents/{incidentId}/status
   */
  async changeStatus(
    incidentId: string,
    request: StatusRequest
  ): Promise<IncidentDetail> {
    const { data } = await api.post<IncidentDetail>(
      `/v1/technician/incidents/${incidentId}/status`,
      {
        status: request.status,
        note: request.note?.trim() ? request.note.trim() : undefined,
      }
    );
    return data;
  },

  /**
   * Historial personal de tareas cumplidas del técnico (casos RESUELTA o CERRADA).
   * GET /api/v1/technician/incidents/history?onlyMine=true
   */
  async getCompletedHistory(
    filters?: TechnicianHistoryFilter
  ): Promise<IncidentSummary[]> {
    const { data } = await api.get<PageResponse<TechnicianIncidentSummary>>(
      '/v1/technician/incidents/history',
      {
        params: {
          onlyMine: true,
          sector: filters?.sector?.trim() || undefined,
          page: 0,
          size: PAGE_SIZE,
        },
      }
    );
    const me = session.getUser()?.id;
    return data.content
      .filter((item) => !me || item.assignedTechnicianId === me)
      .map(toIncidentSummary);
  },

  /**
   * Historial completo del caso: reportes de origen, vínculos y eventos de estado.
   * GET /api/v1/technician/incidents/{incidentId}/timeline
   */
  async getIncidentAuditDetail(incidentId: string): Promise<IncidentDetail> {
    const { data } = await api.get<IncidentDetail>(
      `/v1/technician/incidents/${incidentId}/timeline`
    );
    return data;
  },
};
