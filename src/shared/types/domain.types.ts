/**
 * Tipos compartidos por los modulos de cliente y operador.
 * Reflejan exactamente los DTO Java del backend (fuente de verdad).
 */

export type IncidentStatus =
  | 'SUGERIDA'
  | 'CONFIRMADA'
  | 'EN_ATENCION'
  | 'RESUELTA'
  | 'CERRADA'
  | 'REABIERTA'
  | 'DESCARTADA';

export type Certainty = 'ALTA' | 'MEDIA' | 'BAJA';

export type PriorityLabel = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type FailureType =
  | 'CORTE_TOTAL'
  | 'BAJA_TENSION'
  | 'INTERMITENCIA'
  | 'MEDIDOR'
  | 'ALUMBRADO_PUBLICO'
  | 'OTRO';

export type ReportLinkStatus =
  | 'SUGERIDO'
  | 'CONFIRMADO'
  | 'SEPARADO'
  | 'REASIGNADO';

export type LinkAction =
  | 'VINCULADO'
  | 'CONFIRMADO'
  | 'SEPARADO'
  | 'REASIGNADO'
  | 'REABIERTO';

/**
 * Corresponde a ReportDtos.ReportView
 */
export interface ReportView {
  id: string;
  sector: string | null;
  reference: string | null;
  failureType: FailureType;
  description: string;
  reportedAt: string;
  incidentId: string | null;
  linkStatus: ReportLinkStatus;
  certainty: Certainty | null;
  groupingReason: string | null;
  similarity: number | null;
  linkUpdatedAt: string | null;
}

/**
 * Corresponde a OperatorDtos.StatusEventView: confirmaciones, cambios de
 * estado y asignaciones del caso, con su nota.
 */
export interface StatusEventView {
  id: number;
  eventType: 'CAMBIO_ESTADO' | 'ASIGNACION';
  fromStatus: IncidentStatus | null;
  toStatus: IncidentStatus;
  actorId: string | null;
  actorName?: string | null;
  actorRole: string | null;
  note: string | null;
  createdAt: string;
}

/**
 * Corresponde a PageResponse<T>
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Corresponde a ApiError
 */
export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  details: string[];
  path: string;
}
