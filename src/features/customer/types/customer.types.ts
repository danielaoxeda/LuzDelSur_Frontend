import type {
  Certainty,
  FailureType,
  IncidentStatus,
  ReportView,
} from '../../../shared/types/domain.types';

/**
 * Corresponde a ReportDtos.CreateRequest.
 * Todos los campos opcionales son opcionales tambien en el backend.
 */
export interface CreateReportRequest {
  clientId?: string;
  sector?: string;
  reference?: string;
  failureType: FailureType;
  description: string;
  latitude?: number;
  longitude?: number;
  reportedAt?: string;
}

/**
 * Corresponde a ReportDtos.CreateResponse.
 * En el alta el backend siempre resuelve una incidencia, por eso los
 * campos de incidencia no son nulos.
 */
export interface CreateReportResponse {
  report: ReportView;
  incidentId: string;
  incidentStatus: IncidentStatus;
  certainty: Certainty;
  requiresReview: boolean;
  clientMessage: string;
  reasons: string[];
}

/**
 * Corresponde a ReportDtos.TrackingResponse.
 * Si el reporte fue separado, incidentId puede ser nulo.
 */
export interface TrackingResponse {
  report: ReportView;
  incidentId: string | null;
  incidentStatus: IncidentStatus | null;
  certainty: Certainty | null;
  requiresReview: boolean;
  incidentUpdatedAt: string | null;
  clientMessage: string;
}

/**
 * Corresponde a ReportDtos.PersistenceRequest
 */
export interface PersistenceRequest {
  note?: string;
}
