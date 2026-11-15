import { useCallback, useEffect, useState } from 'react';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { customerService } from '../services/customer.service';
import { listMyReports, type MyReportEntry } from '../services/myReports.registry';
import type { TrackingResponse } from '../types/customer.types';

export interface TrackedMyReport {
  entry: MyReportEntry;
  tracking?: TrackingResponse;
  error?: string;
}

/**
 * Hidrata el indice local de reportes con el endpoint real de seguimiento.
 * Un fallo individual no invalida el resto de la lista.
 */
export function useMyReports() {
  const [items, setItems] = useState<TrackedMyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const entries = listMyReports();

    Promise.allSettled(
      entries.map((entry) => customerService.getTracking(entry.id))
    )
      .then((settled) => {
        if (!active) return;
        setItems(
          entries.map((entry, index) => {
            const result = settled[index];
            if (result.status === 'fulfilled') {
              return { entry, tracking: result.value };
            }
            return {
              entry,
              error: extractApiErrorMessage(
                result.reason,
                'No se pudo actualizar este reporte.'
              ),
            };
          })
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return { items, loading, reload };
}
