import type { StatusEventView } from '../../../shared/types/domain.types';

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

export type { StatusEventView };

/**
 * Corresponde a TechnicianDtos.TechnicianIncidentSummary
 * (GET /api/v1/technician/incidents y /incidents/history)
 */
export interface TechnicianIncidentSummary {
  id: string;
  sector: string;
  failureType: FailureType;
  status: IncidentStatus;
  certainty: Certainty;
  requiresReview: boolean;
  priorityLabel: PriorityLabel;
  priorityScore: number;
  affectedReports: number;
  firstReportedAt: string;
  lastReportedAt: string;
  assignedTechnicianId?: string | null;
  assignedAt?: string | null;
  estimatedScope: string;
  statusUpdatedAt?: string | null;
  closedAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Corresponde a TechnicianDtos.TechnicianReportView
 */
export interface TechnicianReportView {
  id: string;
  sector: string | null;
  reference: string | null;
  failureType: FailureType;
  description: string;
  reportedAt: string;
  linkStatus: ReportLinkStatus;
  certainty: Certainty;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Corresponde a TechnicianDtos.TechnicianIncidentView
 */
export interface TechnicianIncidentView {
  id: string;
  sector: string;
  failureType: FailureType;
  status: IncidentStatus;
  certainty: Certainty;
  requiresReview: boolean;
  priorityLabel: PriorityLabel;
  priorityScore: number;
  affectedReports: number;
  firstReportedAt: string;
  lastReportedAt: string;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  statusUpdatedAt?: string | null;
  statusUpdatedBy?: string | null;
  assignedTechnicianId?: string | null;
  assignedAt?: string | null;
  closedAt?: string | null;
  updatedAt?: string | null;
  estimatedScope: string;
  reports: TechnicianReportView[];
  warnings: string[];
}

/**
 * Corresponde a OperatorDtos.IncidentSummary
 */
export interface IncidentSummary {
  id: string;
  sector: string;
  failureType: FailureType;
  status: IncidentStatus;
  certainty: Certainty;
  requiresReview: boolean;
  priorityScore: number;
  priorityLabel: PriorityLabel;
  reportCount: number;
  firstReportedAt: string;
  lastReportedAt: string;
  confirmedAt: string | null;
  confirmedBy: string | null;
  assignedTechnicianId?: string | null;
  assignedAt?: string | null;
  closedAt: string | null;
  updatedAt: string;
  version: number;
}

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
 * Corresponde a OperatorDtos.LinkHistoryView
 */
export interface LinkHistoryView {
  id: number;
  reportId: string;
  fromIncidentId: string | null;
  toIncidentId: string | null;
  action: LinkAction;
  actorId: string;
  actorName?: string | null;
  note: string | null;
  createdAt: string;
}

/**
 * Corresponde a OperatorDtos.IncidentDetail
 */
export interface IncidentDetail {
  incident: IncidentSummary;
  reports: ReportView[];
  history: LinkHistoryView[];
  alerts: string[];
  statusHistory?: StatusEventView[];
}

/**
 * Corresponde a OperatorDtos.StatusRequest
 * El técnico solo puede cambiar el caso a EN_ATENCION o RESUELTA.
 */
export interface StatusRequest {
  status: 'EN_ATENCION' | 'RESUELTA';
  note?: string;
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
