import { api } from '../../../shared/services/api';
import type {
  CreateReportRequest,
  CreateReportResponse,
  PersistenceRequest,
  TrackingResponse,
} from '../types/customer.types';

/**
 * Servicio real del cliente. Sin mocks ni fallback: cualquier fallo de la API
 * se propaga a la vista para que no se oculte un error de integracion.
 */
export const customerService = {
  /**
   * ReportController: POST /api/v1/reports
   */
  async createReport(request: CreateReportRequest): Promise<CreateReportResponse> {
    const { data } = await api.post<CreateReportResponse>('/v1/reports', request);
    return data;
  },

  /**
   * ReportController: GET /api/v1/reports/{reportId}
   */
  async getTracking(reportId: string): Promise<TrackingResponse> {
    const { data } = await api.get<TrackingResponse>(`/v1/reports/${reportId}`);
    return data;
  },

  /**
   * ReportController: POST /api/v1/reports/{reportId}/persistence
   */
  async reportPersistence(
    reportId: string,
    request: PersistenceRequest
  ): Promise<TrackingResponse> {
    const { data } = await api.post<TrackingResponse>(
      `/v1/reports/${reportId}/persistence`,
      request
    );
    return data;
  },
};
