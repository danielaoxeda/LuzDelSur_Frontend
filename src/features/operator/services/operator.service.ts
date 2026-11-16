import { api } from '../../../shared/services/api';
import type { PageResponse } from '../../../shared/types/domain.types';
import type {
  AssignRequest,
  ConfirmRequest,
  IncidentDetail,
  IncidentQuery,
  IncidentSummary,
  ReassignRequest,
  SeparateRequest,
  SeparationResult,
  StatusRequest,
  TechnicianOption,
} from '../types/operator.types';

/**
 * Servicio real del operador. Sin mocks ni fallback.
 *
 * Todos los endpoints exigen sesion con rol OPERADOR (JWT que adjunta el
 * interceptor de Axios).
 */
export const operatorService = {
  /**
   * OperatorController: GET /api/v1/operator/incidents
   */
  async getIncidents(
    query: IncidentQuery = {}
  ): Promise<PageResponse<IncidentSummary>> {
    const { data } = await api.get<PageResponse<IncidentSummary>>(
      '/v1/operator/incidents',
      {
        params: {
          status: query.status,
          certainty: query.certainty,
          requiresReview: query.requiresReview,
          failureType: query.failureType,
          sector: query.sector?.trim() || undefined,
          onlyOpen: query.onlyOpen ?? true,
          page: query.page ?? 0,
          size: query.size ?? 20,
        },
      }
    );
    return data;
  },

  /**
   * OperatorController: GET /api/v1/operator/incidents/{incidentId}
   */
  async getIncidentDetail(incidentId: string): Promise<IncidentDetail> {
    const { data } = await api.get<IncidentDetail>(
      `/v1/operator/incidents/${incidentId}`
    );
    return data;
  },

  /**
   * OperatorController: POST /api/v1/operator/incidents/{incidentId}/confirm
   */
  async confirmGrouping(
    incidentId: string,
    request: ConfirmRequest
  ): Promise<IncidentDetail> {
    const { data } = await api.post<IncidentDetail>(
      `/v1/operator/incidents/${incidentId}/confirm`,
      request
    );
    return data;
  },

  /**
   * OperatorController: POST /api/v1/operator/incidents/{incidentId}/status
   */
  async changeStatus(
    incidentId: string,
    request: StatusRequest
  ): Promise<IncidentDetail> {
    const { data } = await api.post<IncidentDetail>(
      `/v1/operator/incidents/${incidentId}/status`,
      request
    );
    return data;
  },

  /**
   * OperatorController: POST /api/v1/operator/incidents/{incidentId}/assign
   */
  async assignTechnician(
    incidentId: string,
    request: AssignRequest
  ): Promise<IncidentDetail> {
    const { data } = await api.post<IncidentDetail>(
      `/v1/operator/incidents/${incidentId}/assign`,
      request
    );
    return data;
  },

  /**
   * StaffController: GET /api/v1/operator/technicians
   */
  async getTechnicians(onlyActive = true): Promise<TechnicianOption[]> {
    const { data } = await api.get<TechnicianOption[]>('/v1/operator/technicians', {
      params: { onlyActive },
    });
    return data;
  },

  /**
   * OperatorController: POST /api/v1/operator/reports/{reportId}/separate
   */
  async separateReport(
    reportId: string,
    request: SeparateRequest
  ): Promise<SeparationResult> {
    const { data } = await api.post<SeparationResult>(
      `/v1/operator/reports/${reportId}/separate`,
      request
    );
    return data;
  },

  /**
   * OperatorController: POST /api/v1/operator/reports/{reportId}/reassign
   */
  async reassignReport(
    reportId: string,
    request: ReassignRequest
  ): Promise<IncidentDetail> {
    const { data } = await api.post<IncidentDetail>(
      `/v1/operator/reports/${reportId}/reassign`,
      request
    );
    return data;
  },

  /**
   * Candidatos para reasignar: casos abiertos distintos del caso actual.
   * Usa el listado real de la bandeja con onlyOpen=true.
   */
  async getReassignTargets(
    currentIncidentId: string
  ): Promise<IncidentSummary[]> {
    const page = await this.getIncidents({
      onlyOpen: true,
      page: 0,
      size: 50,
    });
    return page.content.filter((incident) => incident.id !== currentIncidentId);
  },
};
