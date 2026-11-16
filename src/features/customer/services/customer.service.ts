import { api } from '../../../shared/services/api';
import type { PageResponse } from '../../../shared/types/domain.types';
import type {
  CreateReportRequest,
  CreateReportResponse,
  FeedbackRequest,
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
   * ReportController: GET /api/v1/reports/mine (requiere sesion de cliente)
   */
  async getMyReports(page = 0, size = 20): Promise<PageResponse<TrackingResponse>> {
    const { data } = await api.get<PageResponse<TrackingResponse>>('/v1/reports/mine', {
      params: { page, size },
    });
    return data;
  },

  /**
   * ReportController: POST /api/v1/reports/{reportId}/feedback
   * Solo el dueno del reporte, una vez, con el caso RESUELTA o CERRADA.
   */
  async rateService(reportId: string, request: FeedbackRequest): Promise<TrackingResponse> {
    const { data } = await api.post<TrackingResponse>(
      `/v1/reports/${reportId}/feedback`,
      request
    );
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
