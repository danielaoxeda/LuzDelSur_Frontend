import { api } from '../../../shared/services/api';
import type {
  IncidentDetail,
  IncidentSummary,
  LinkHistoryView,
  PageResponse,
  ReportView,
  StatusRequest,
  TechnicianIncidentView,
  TechnicianReportView,
} from '../types/technician.types';

const USE_MOCK = true;

interface MockIncidentRecord {
  summary: IncidentSummary;
  estimatedScope: string;
  warnings: string[];
  reports: ReportView[];
  history: LinkHistoryView[];
}

const INITIAL_MOCK_RECORDS: MockIncidentRecord[] = [
  {
    summary: {
      id: '88898a10-4b20-4c11-9a10-000000088898',
      sector: 'Surquillo',
      failureType: 'CORTE_TOTAL',
      status: 'CONFIRMADA',
      certainty: 'ALTA',
      requiresReview: false,
      priorityScore: 0.94,
      priorityLabel: 'CRITICA',
      reportCount: 3,
      firstReportedAt: '2026-11-15T00:10:00Z',
      lastReportedAt: '2026-11-15T00:24:00Z',
      confirmedAt: '2026-11-15T00:26:00Z',
      confirmedBy: 'operador-1',
      closedAt: null,
      updatedAt: '2026-11-15T00:26:00Z',
      version: 2,
    },
    estimatedScope: 'Sector Surquillo - 3 reporte(s) entre 14/11 19:10 y 14/11 19:24',
    warnings: [],
    reports: [
      {
        id: '31048520-0001-4000-8000-000000000001',
        sector: 'Surquillo',
        reference: 'Av. Angamos Este 1840',
        failureType: 'CORTE_TOTAL',
        description: 'Corte total de suministro eléctrico en toda la cuadra 18.',
        reportedAt: '2026-11-15T00:10:00Z',
        incidentId: '88898a10-4b20-4c11-9a10-000000088898',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector, tipo de falla y ventana temporal',
        similarity: 0.91,
        linkUpdatedAt: '2026-11-15T00:26:00Z',
      },
      {
        id: '31048520-0002-4000-8000-000000000002',
        sector: 'Surquillo',
        reference: 'Av. Angamos Este 1862',
        failureType: 'CORTE_TOTAL',
        description: 'Se escuchó un chispazo en el poste de la esquina y se fue la luz.',
        reportedAt: '2026-11-15T00:16:00Z',
        incidentId: '88898a10-4b20-4c11-9a10-000000088898',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector y coincidencia semántica alta',
        similarity: 0.87,
        linkUpdatedAt: '2026-11-15T00:26:00Z',
      },
      {
        id: '31048520-0003-4000-8000-000000000003',
        sector: 'Surquillo',
        reference: 'Calle San Diego 215',
        failureType: 'CORTE_TOTAL',
        description: 'Sin energía eléctrica en comercios cercanos a Angamos.',
        reportedAt: '2026-11-15T00:24:00Z',
        incidentId: '88898a10-4b20-4c11-9a10-000000088898',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Agrupado automáticamente dentro de ventana de 30 min',
        similarity: 0.83,
        linkUpdatedAt: '2026-11-15T00:26:00Z',
      },
    ],
    history: [
      {
        id: 101,
        reportId: '31048520-0001-4000-8000-000000000001',
        fromIncidentId: '88898a10-4b20-4c11-9a10-000000088898',
        toIncidentId: '88898a10-4b20-4c11-9a10-000000088898',
        action: 'CONFIRMADO',
        actorId: 'operador-1',
        note: 'Agrupación verificada por el operador de turno.',
        createdAt: '2026-11-15T00:26:00Z',
      },
    ],
  },
  {
    summary: {
      id: '88904b20-4b20-4c11-9a10-000000088904',
      sector: 'Santiago de Surco',
      failureType: 'BAJA_TENSION',
      status: 'EN_ATENCION',
      certainty: 'MEDIA',
      requiresReview: false,
      priorityScore: 0.68,
      priorityLabel: 'MEDIA',
      reportCount: 2,
      firstReportedAt: '2026-11-14T23:30:00Z',
      lastReportedAt: '2026-11-14T23:45:00Z',
      confirmedAt: '2026-11-14T23:50:00Z',
      confirmedBy: 'operador-1',
      closedAt: null,
      updatedAt: '2026-11-15T00:05:00Z',
      version: 3,
    },
    estimatedScope:
      'Sector Santiago de Surco - 2 reporte(s) entre 14/11 18:30 y 14/11 18:45',
    warnings: [
      'Certeza media: verificar caída de tensión en bornera de subestación.',
    ],
    reports: [
      {
        id: '18452090-0001-4000-8000-000000000001',
        sector: 'Santiago de Surco',
        reference: 'Jr. Belisario Suárez 410',
        failureType: 'BAJA_TENSION',
        description: 'Baja tensión intermitente, las luminarias parpadean.',
        reportedAt: '2026-11-14T23:30:00Z',
        incidentId: '88904b20-4b20-4c11-9a10-000000088904',
        linkStatus: 'CONFIRMADO',
        certainty: 'MEDIA',
        groupingReason: 'Mismo sector y ventana temporal',
        similarity: 0.64,
        linkUpdatedAt: '2026-11-14T23:50:00Z',
      },
      {
        id: '18452090-0002-4000-8000-000000000002',
        sector: 'Santiago de Surco',
        reference: 'Jr. Belisario Suárez 438',
        failureType: 'BAJA_TENSION',
        description: 'Los equipos eléctricos se apagan por variación de voltaje.',
        reportedAt: '2026-11-14T23:45:00Z',
        incidentId: '88904b20-4b20-4c11-9a10-000000088904',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector y tipo de falla',
        similarity: 0.78,
        linkUpdatedAt: '2026-11-14T23:50:00Z',
      },
    ],
    history: [
      {
        id: 102,
        reportId: '18452090-0001-4000-8000-000000000001',
        fromIncidentId: '88904b20-4b20-4c11-9a10-000000088904',
        toIncidentId: '88904b20-4b20-4c11-9a10-000000088904',
        action: 'CONFIRMADO',
        actorId: 'operador-1',
        note: 'Confirmado y despachado a cuadrilla de campo.',
        createdAt: '2026-11-14T23:50:00Z',
      },
    ],
  },
  {
    summary: {
      id: '88876c30-4b20-4c11-9a10-000000088876',
      sector: 'San Isidro',
      failureType: 'MEDIDOR',
      status: 'CONFIRMADA',
      certainty: 'ALTA',
      requiresReview: false,
      priorityScore: 0.42,
      priorityLabel: 'BAJA',
      reportCount: 1,
      firstReportedAt: '2026-11-14T22:15:00Z',
      lastReportedAt: '2026-11-14T22:15:00Z',
      confirmedAt: '2026-11-14T22:30:00Z',
      confirmedBy: 'operador-1',
      closedAt: null,
      updatedAt: '2026-11-14T22:30:00Z',
      version: 1,
    },
    estimatedScope: 'Sector San Isidro - 1 reporte(s) entre 14/11 17:15 y 14/11 17:15',
    warnings: [],
    reports: [
      {
        id: '19827340-0001-4000-8000-000000000001',
        sector: 'San Isidro',
        reference: 'Calle Las Camelias 280',
        failureType: 'MEDIDOR',
        description: 'Acometida dañada en caja toma F-1 del predio.',
        reportedAt: '2026-11-14T22:15:00Z',
        incidentId: '88876c30-4b20-4c11-9a10-000000088876',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Caso individual confirmado',
        similarity: null,
        linkUpdatedAt: '2026-11-14T22:30:00Z',
      },
    ],
    history: [
      {
        id: 103,
        reportId: '19827340-0001-4000-8000-000000000001',
        fromIncidentId: '88876c30-4b20-4c11-9a10-000000088876',
        toIncidentId: '88876c30-4b20-4c11-9a10-000000088876',
        action: 'CONFIRMADO',
        actorId: 'operador-1',
        note: 'Inspección programada para cuadrilla técnica.',
        createdAt: '2026-11-14T22:30:00Z',
      },
    ],
  },
  {
    summary: {
      id: '98241d40-4b20-4c11-9a10-000000098241',
      sector: 'San Borja',
      failureType: 'BAJA_TENSION',
      status: 'RESUELTA',
      certainty: 'ALTA',
      requiresReview: false,
      priorityScore: 0.75,
      priorityLabel: 'ALTA',
      reportCount: 2,
      firstReportedAt: '2026-11-14T16:10:00Z',
      lastReportedAt: '2026-11-14T16:22:00Z',
      confirmedAt: '2026-11-14T16:30:00Z',
      confirmedBy: 'operador-1',
      closedAt: '2026-11-14T19:15:00Z',
      updatedAt: '2026-11-14T19:15:00Z',
      version: 4,
    },
    estimatedScope: 'Sector San Borja - 2 reporte(s) entre 14/11 11:10 y 14/11 11:22',
    warnings: [],
    reports: [
      {
        id: '30492810-0001-4000-8000-000000000001',
        sector: 'San Borja',
        reference: 'Av. Guardia Civil 640',
        failureType: 'BAJA_TENSION',
        description: 'Caída de tensión en red aérea secundaria.',
        reportedAt: '2026-11-14T16:10:00Z',
        incidentId: '98241d40-4b20-4c11-9a10-000000098241',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector y tipo de falla',
        similarity: 0.89,
        linkUpdatedAt: '2026-11-14T16:30:00Z',
      },
      {
        id: '30492810-0002-4000-8000-000000000002',
        sector: 'San Borja',
        reference: 'Av. Guardia Civil 658',
        failureType: 'BAJA_TENSION',
        description: 'Falla en fase de suministro domiciliario.',
        reportedAt: '2026-11-14T16:22:00Z',
        incidentId: '98241d40-4b20-4c11-9a10-000000098241',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector y ventana temporal',
        similarity: 0.84,
        linkUpdatedAt: '2026-11-14T16:30:00Z',
      },
    ],
    history: [
      {
        id: 201,
        reportId: '30492810-0001-4000-8000-000000000001',
        fromIncidentId: '98241d40-4b20-4c11-9a10-000000098241',
        toIncidentId: '98241d40-4b20-4c11-9a10-000000098241',
        action: 'CONFIRMADO',
        actorId: 'tecnico-1',
        note: 'Reemplazo de elemento fusible 20A en poste de distribución.',
        createdAt: '2026-11-14T19:15:00Z',
      },
    ],
  },
  {
    summary: {
      id: '98230e50-4b20-4c11-9a10-000000098230',
      sector: 'Miraflores',
      failureType: 'INTERMITENCIA',
      status: 'CERRADA',
      certainty: 'ALTA',
      requiresReview: false,
      priorityScore: 0.61,
      priorityLabel: 'MEDIA',
      reportCount: 2,
      firstReportedAt: '2026-11-14T14:00:00Z',
      lastReportedAt: '2026-11-14T14:18:00Z',
      confirmedAt: '2026-11-14T14:25:00Z',
      confirmedBy: 'operador-1',
      closedAt: '2026-11-14T17:40:00Z',
      updatedAt: '2026-11-14T17:40:00Z',
      version: 5,
    },
    estimatedScope: 'Sector Miraflores - 2 reporte(s) entre 14/11 09:00 y 14/11 09:18',
    warnings: [],
    reports: [
      {
        id: '88129030-0001-4000-8000-000000000001',
        sector: 'Miraflores',
        reference: 'Jr. Huiracocha 118',
        failureType: 'INTERMITENCIA',
        description: 'Microcortes continuos cada 10 minutos.',
        reportedAt: '2026-11-14T14:00:00Z',
        incidentId: '98230e50-4b20-4c11-9a10-000000098230',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector y tipo de falla',
        similarity: 0.88,
        linkUpdatedAt: '2026-11-14T14:25:00Z',
      },
      {
        id: '88129030-0002-4000-8000-000000000002',
        sector: 'Miraflores',
        reference: 'Jr. Huiracocha 142',
        failureType: 'INTERMITENCIA',
        description: 'Falso contacto en acometida aérea.',
        reportedAt: '2026-11-14T14:18:00Z',
        incidentId: '98230e50-4b20-4c11-9a10-000000098230',
        linkStatus: 'CONFIRMADO',
        certainty: 'ALTA',
        groupingReason: 'Mismo sector y ventana temporal',
        similarity: 0.82,
        linkUpdatedAt: '2026-11-14T14:25:00Z',
      },
    ],
    history: [
      {
        id: 202,
        reportId: '88129030-0001-4000-8000-000000000001',
        fromIncidentId: '98230e50-4b20-4c11-9a10-000000098230',
        toIncidentId: '98230e50-4b20-4c11-9a10-000000098230',
        action: 'CONFIRMADO',
        actorId: 'tecnico-1',
        note: 'Empalme recalentado reemplazado en bornera de distribución.',
        createdAt: '2026-11-14T17:40:00Z',
      },
    ],
  },
];

const mockStore: MockIncidentRecord[] = structuredClone(INITIAL_MOCK_RECORDS);
let nextHistoryId = 300;

const ASSIGNED_STATUSES = new Set(['CONFIRMADA', 'EN_ATENCION', 'REABIERTA']);
const COMPLETED_STATUSES = new Set(['RESUELTA', 'CERRADA']);

export const technicianService = {
  /**
   * Lista las incidencias abiertas confirmadas/en atención.
   * Endpoint real en backend: GET /api/v1/operator/incidents?onlyOpen=true
   */
  async getAssignedTasks(): Promise<IncidentSummary[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return mockStore
        .map((r) => ({ ...r.summary }))
        .filter((item) => ASSIGNED_STATUSES.has(item.status));
    }

    const { data } = await api.get<PageResponse<IncidentSummary>>(
      '/v1/operator/incidents',
      { params: { onlyOpen: true, page: 0, size: 50 } }
    );
    return data.content.filter((item) => ASSIGNED_STATUSES.has(item.status));
  },

  /**
   * Contexto consolidado del técnico (incidencia padre + reportes hijos).
   * Endpoint real en TechnicianController: GET /api/v1/technician/incidents/{incidentId}
   */
  async getConsolidatedDetail(incidentId: string): Promise<TechnicianIncidentView> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const record = mockStore.find((r) => r.summary.id === incidentId);
      if (!record) {
        throw new Error(`Incidencia no encontrada: ${incidentId}`);
      }

      const reports: TechnicianReportView[] = record.reports.map((rep) => ({
        id: rep.id,
        sector: rep.sector,
        reference: rep.reference,
        failureType: rep.failureType,
        description: rep.description,
        reportedAt: rep.reportedAt,
        linkStatus: rep.linkStatus,
        certainty: rep.certainty ?? 'ALTA',
      }));

      return {
        id: record.summary.id,
        sector: record.summary.sector,
        failureType: record.summary.failureType,
        status: record.summary.status,
        certainty: record.summary.certainty,
        requiresReview: record.summary.requiresReview,
        priorityLabel: record.summary.priorityLabel,
        priorityScore: record.summary.priorityScore,
        affectedReports: record.summary.reportCount,
        firstReportedAt: record.summary.firstReportedAt,
        lastReportedAt: record.summary.lastReportedAt,
        estimatedScope: record.estimatedScope,
        reports,
        warnings: record.warnings,
      };
    }

    const { data } = await api.get<TechnicianIncidentView>(
      `/v1/technician/incidents/${incidentId}`
    );
    return data;
  },

  /**
   * Cambia el estado de la incidencia a EN_ATENCION o RESUELTA.
   * Endpoint real en TechnicianController: POST /api/v1/technician/incidents/{incidentId}/status
   */
  async changeStatus(
    incidentId: string,
    request: StatusRequest
  ): Promise<IncidentDetail> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const record = mockStore.find((r) => r.summary.id === incidentId);
      if (!record) {
        throw new Error(`Incidencia no encontrada: ${incidentId}`);
      }

      const nowIso = new Date().toISOString();
      const actorId = localStorage.getItem('actor_id') || 'tecnico-1';

      record.summary = {
        ...record.summary,
        status: request.status,
        updatedAt: nowIso,
        closedAt: request.status === 'RESUELTA' ? nowIso : record.summary.closedAt,
        version: record.summary.version + 1,
      };

      const firstReportId =
        record.reports[0]?.id ?? '00000000-0000-0000-0000-000000000000';
      record.history = [
        {
          id: ++nextHistoryId,
          reportId: firstReportId,
          fromIncidentId: record.summary.id,
          toIncidentId: record.summary.id,
          action: 'CONFIRMADO',
          actorId,
          note:
            request.note?.trim() ||
            (request.status === 'EN_ATENCION'
              ? 'Cuadrilla técnica inició atención en campo.'
              : 'Servicio eléctrico restablecido.'),
          createdAt: nowIso,
        },
        ...record.history,
      ];

      return {
        incident: { ...record.summary },
        reports: [...record.reports],
        history: [...record.history],
        alerts: [...record.warnings],
      };
    }

    const { data } = await api.post<IncidentDetail>(
      `/v1/technician/incidents/${incidentId}/status`,
      request
    );
    return data;
  },

  /**
   * Lista las incidencias resueltas y cerradas.
   * Endpoint real en backend: GET /api/v1/operator/incidents?onlyOpen=false
   */
  async getCompletedHistory(sectorFilter?: string): Promise<IncidentSummary[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const cleanSector = sectorFilter?.trim().toLowerCase();
      return mockStore
        .map((r) => ({ ...r.summary }))
        .filter((item) => {
          if (!COMPLETED_STATUSES.has(item.status)) return false;
          if (cleanSector && !item.sector.toLowerCase().includes(cleanSector)) {
            return false;
          }
          return true;
        });
    }

    const { data } = await api.get<PageResponse<IncidentSummary>>(
      '/v1/operator/incidents',
      {
        params: {
          onlyOpen: false,
          sector: sectorFilter?.trim() || undefined,
          page: 0,
          size: 50,
        },
      }
    );
    return data.content.filter((item) => COMPLETED_STATUSES.has(item.status));
  },

  /**
   * Detalle completo con reportes e historial de vínculos (LinkHistoryView).
   * Endpoint real en backend: GET /api/v1/operator/incidents/{incidentId}
   */
  async getIncidentAuditDetail(incidentId: string): Promise<IncidentDetail> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const record = mockStore.find((r) => r.summary.id === incidentId);
      if (!record) {
        throw new Error(`Incidencia no encontrada: ${incidentId}`);
      }
      return {
        incident: { ...record.summary },
        reports: [...record.reports],
        history: [...record.history],
        alerts: [...record.warnings],
      };
    }

    const { data } = await api.get<IncidentDetail>(
      `/v1/operator/incidents/${incidentId}`
    );
    return data;
  },
};
