import { useCallback, useEffect, useState } from 'react';
import { extractApiErrorMessage } from '../../../shared/services/api';
import type { PageResponse } from '../../../shared/types/domain.types';
import { customerService } from '../services/customer.service';
import type { TrackingResponse } from '../types/customer.types';

export interface MyReportEntry {
  id: string;
  registeredAt: string;
}

export interface TrackedMyReport {
  entry: MyReportEntry;
  tracking?: TrackingResponse;
  error?: string;
}

/**
 * Reportes del cliente autenticado: GET /api/v1/reports/mine.
 * El backend filtra por el usuario del JWT, por lo que la lista es la misma
 * en cualquier navegador o dispositivo. La respuesta usa paginación del
 * servidor (page/size) y se devuelve completa para mostrar los totales.
 */
export function useMyReports(size = 50, page = 0) {
  const [items, setItems] = useState<TrackedMyReport[]>([]);
  const [pageData, setPageData] =
    useState<PageResponse<TrackingResponse> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${reloadKey}:${page}:${size}`;
  // Evita un setState sincrono dentro del efecto: la carga se deriva de la
  // clave de la ultima consulta completada.
  const loading = loadedKey !== requestKey;

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    customerService
      .getMyReports(page, size)
      .then((data) => {
        if (!active) return;
        setError(null);
        setPageData(data);
        setItems(
          data.content.map((tracking) => ({
            entry: {
              id: tracking.report.id,
              registeredAt: tracking.report.reportedAt,
            },
            tracking,
          }))
        );
      })
      .catch((err) => {
        if (!active) return;
        setItems([]);
        setPageData(null);
        setError(
          extractApiErrorMessage(err, 'No se pudieron obtener sus reportes.')
        );
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [requestKey, page, size]);

  return { items, loading, error, pageData, reload };
}
