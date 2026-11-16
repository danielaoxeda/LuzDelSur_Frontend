import type {
  Certainty,
  FailureType,
  IncidentStatus,
} from '../../../shared/types/domain.types';

export interface InboxFilterValues {
  status: IncidentStatus | '';
  certainty: Certainty | '';
  requiresReview: '' | 'true' | 'false';
  failureType: FailureType | '';
  sector: string;
  onlyOpen: boolean;
}

export const EMPTY_INBOX_FILTERS: InboxFilterValues = {
  status: '',
  certainty: '',
  requiresReview: '',
  failureType: '',
  sector: '',
  onlyOpen: true,
};
