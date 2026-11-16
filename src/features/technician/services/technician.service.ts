import { api } from '../../../shared/services/api';
import { session } from '../../../shared/services/session';
import type {
  IncidentDetail,
  IncidentSummary,
  PageResponse,
  StatusRequest,
  TechnicianIncidentSummary,
  TechnicianIncidentView,
} from '../types/technician.types';

const PAGE_SIZE = 50;

/**
 * Adapta la fila del TechnicianController al IncidentSummary que ya usan las
 * vistas (reportCount = affectedReports).
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
    closedAt: item.closedAt ?? null,
    updatedAt: item.updatedAt ?? item.statusUpdatedAt ?? item.lastReportedAt,
    version: 0,
  };
}

/**
 * Servicio real del tecnico. Todos los endpoints exigen sesion con rol TECNICO.
 */
export const technicianService = {
  /**
   * Tareas del tecnico: casos CONFIRMADA, EN_ATENCION o REABIERTA asignados a el
   * o todavia sin tecnico (los puede tomar al iniciar la atencion).
   * TechnicianController: GET /api/v1/technician/incidents
   */
  async getAssignedTasks(): Promise<IncidentSummary[]> {
    const { data } = await api.get<PageResponse<TechnicianIncidentSummary>>(
      '/v1/technician/incidents',
      { params: { page: 0, size: PAGE_SIZE } }
    );
    const me = session.getUser()?.id;
    return data.content
      .filter((item) => !item.assignedTechnicianId || item.assignedTechnicianId === me)
      .map(toIncidentSummary);
  },

  /**
   * Contexto consolidado (incidencia padre + reportes hijos con coordenadas).
   * TechnicianController: GET /api/v1/technician/incidents/{incidentId}
   */
  async getConsolidatedDetail(incidentId: string): Promise<TechnicianIncidentView> {
    const { data } = await api.get<TechnicianIncidentView>(
      `/v1/technician/incidents/${incidentId}`
    );
    return data;
  },

  /**
   * Cambia el estado a EN_ATENCION o RESUELTA. La nota queda en statusHistory.
   * TechnicianController: POST /api/v1/technician/incidents/{incidentId}/status
   */
  async changeStatus(incidentId: string, request: StatusRequest): Promise<IncidentDetail> {
    const { data } = await api.post<IncidentDetail>(
      `/v1/technician/incidents/${incidentId}/status`,
      request
    );
    return data;
  },

  /**
   * Tareas cumplidas del tecnico (RESUELTA o CERRADA).
   * TechnicianController: GET /api/v1/technician/incidents/history?onlyMine=true
   */
  async getCompletedHistory(sectorFilter?: string): Promise<IncidentSummary[]> {
    const { data } = await api.get<PageResponse<TechnicianIncidentSummary>>(
      '/v1/technician/incidents/history',
      {
        params: {
          onlyMine: true,
          sector: sectorFilter?.trim() || undefined,
          page: 0,
          size: PAGE_SIZE,
        },
      }
    );
    return data.content.map(toIncidentSummary);
  },

  /**
   * Historial completo del caso: reportes, vinculos y eventos de estado.
   * TechnicianController: GET /api/v1/technician/incidents/{incidentId}/timeline
   */
  async getIncidentAuditDetail(incidentId: string): Promise<IncidentDetail> {
    const { data } = await api.get<IncidentDetail>(
      `/v1/technician/incidents/${incidentId}/timeline`
    );
    return data;
  },
};
