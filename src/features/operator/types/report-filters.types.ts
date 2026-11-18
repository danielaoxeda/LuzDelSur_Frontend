import type {
  FailureType,
  ReportLinkStatus,
} from '../../../shared/types/domain.types';

/**
 * Filtros aceptados por GET /api/v1/operator/reports.
 * Las fechas se manejan como yyyy-MM-dd y la vista las convierte a Instant.
 */
export interface ReportFilterValues {
  incidentId: string;
  linkStatus: ReportLinkStatus | '';
  failureType: FailureType | '';
  sector: string;
  from: string;
  to: string;
}

export const EMPTY_REPORT_FILTERS: ReportFilterValues = {
  incidentId: '',
  linkStatus: '',
  failureType: '',
  sector: '',
  from: '',
  to: '',
};
