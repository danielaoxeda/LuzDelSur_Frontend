import type {
  Certainty,
  FailureType,
  IncidentStatus,
  LinkAction,
  PriorityLabel,
  ReportLinkStatus,
  ReportView,
  StatusEventView,
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
  assignedTechnicianId?: string | null;
  assignedAt?: string | null;
  closedAt: string | null;
  updatedAt: string;
  version: number;
  /** Solo en el detalle: nombres legibles de los actores. */
  confirmedByName?: string | null;
  assignedTechnicianName?: string | null;
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
 * Corresponde a OperatorDtos.AssignRequest
 */
export interface AssignRequest {
  technicianId: string;
  note?: string;
}

/**
 * Corresponde a AuthDtos.TechnicianView (GET /api/v1/operator/technicians)
 */
export interface TechnicianOption {
  id: string;
  name: string;
  username: string;
  active: boolean;
  openAssignments: number;
  lastLoginAt: string | null;
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

/**
 * Corresponde a OperatorDtos.SectorCount
 */
export interface SectorCount {
  sector: string;
  openIncidents: number;
  reports: number;
}

/**
 * Corresponde a OperatorDtos.MetricsView (GET /api/v1/operator/metrics).
 * Los mapas usan el nombre del enum como clave (IncidentStatus, PriorityLabel
 * y FailureType).
 */
export interface MetricsView {
  generatedAt: string;
  openIncidents: number;
  pendingReview: number;
  lowCertaintyOpen: number;
  unassignedConfirmed: number;
  reportsLast24h: number;
  incidentsLast24h: number;
  avgMinutesToConfirm: number | null;
  avgMinutesToResolve: number | null;
  byStatus: Partial<Record<IncidentStatus, number>>;
  openByPriority: Partial<Record<PriorityLabel, number>>;
  openByFailureType: Partial<Record<FailureType, number>>;
  topSectors: SectorCount[];
}

/**
 * Corresponde a AuthDtos.StaffCreateRequest (POST /api/v1/operator/technicians)
 */
export interface TechnicianCreateRequest {
  name: string;
  username: string;
  password: string;
}

/**
 * Corresponde a AuthDtos.StaffUpdateRequest
 * (PATCH /api/v1/operator/technicians/{technicianId}). El backend solo
 * permite cambiar el estado activo de la cuenta.
 */
export interface TechnicianUpdateRequest {
  active: boolean;
}

/**
 * Parametros aceptados por GET /api/v1/operator/reports
 */
export interface ReportQuery {
  incidentId?: string;
  linkStatus?: ReportLinkStatus;
  failureType?: FailureType;
  sector?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
