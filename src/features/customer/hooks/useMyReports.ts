import { useCallback, useEffect, useState } from 'react';
import { extractApiErrorMessage } from '../../../shared/services/api';
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
 * en cualquier navegador o dispositivo.
 */
export function useMyReports(size = 50) {
  const [items, setItems] = useState<TrackedMyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    customerService
      .getMyReports(0, size)
      .then((page) => {
        if (!active) return;
        setError(null);
        setItems(
          page.content.map((tracking) => ({
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
        setError(
          extractApiErrorMessage(err, 'No se pudieron obtener sus reportes.')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, size]);

  return { items, loading, error, reload };
}
