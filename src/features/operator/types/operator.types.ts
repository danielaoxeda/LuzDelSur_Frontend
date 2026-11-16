import type {
  Certainty,
  FailureType,
  IncidentStatus,
  LinkAction,
  PriorityLabel,
  ReportView,
} from '../../../shared/types/domain.types';

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
  closedAt: string | null;
  updatedAt: string;
  version: number;
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
}

/**
 * Corresponde a OperatorDtos.ConfirmRequest
 */
export interface ConfirmRequest {
  note?: string;
}

/**
 * Corresponde a OperatorDtos.StatusRequest
 */
export interface StatusRequest {
  status: IncidentStatus;
  note?: string;
}

/**
 * Corresponde a OperatorDtos.SeparateRequest
 */
export interface SeparateRequest {
  createNewIncident?: boolean;
  note?: string;
}

/**
 * Corresponde a OperatorDtos.ReassignRequest
 */
export interface ReassignRequest {
  targetIncidentId: string;
  note?: string;
}

/**
 * Corresponde a OperatorDtos.SeparationResult
 */
export interface SeparationResult {
  sourceIncident: IncidentDetail;
  newIncidentId: string | null;
}

/**
 * Parametros aceptados por GET /api/v1/operator/incidents
 */
export interface IncidentQuery {
  status?: IncidentStatus;
  certainty?: Certainty;
  requiresReview?: boolean;
  failureType?: FailureType;
  sector?: string;
  onlyOpen?: boolean;
  page?: number;
  size?: number;
}
