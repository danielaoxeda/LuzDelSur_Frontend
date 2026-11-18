import { useCallback, useEffect, useState } from 'react';
import { extractApiErrorMessage } from '../../../shared/services/api';
import { customerService } from '../services/customer.service';
import type { TrackingResponse } from '../types/customer.types';

/**
 * El backend limita `size` a 50 en GET /api/v1/reports/mine, por lo que se
 * recorren las paginas necesarias para tener el historial completo en el
 * cliente. Asi el filtro y el orden se aplican sobre todos los reportes y no
 * solo sobre la pagina visible.
 */
const SERVER_PAGE_SIZE = 50;
const MAX_SERVER_PAGES = 20;

export interface MyReportEntry {
  id: string;
  registeredAt: string;
}

export interface TrackedMyReport {
  entry: MyReportEntry;
  tracking?: TrackingResponse;
  error?: string;
}

export function useMyReports() {
  const [items, setItems] = useState<TrackedMyReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<number | null>(null);

  // Evita un setState sincrono dentro del efecto: la carga se deriva de la
  // clave de la ultima consulta completada.
  const loading = loadedKey !== reloadKey;

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const first = await customerService.getMyReports(0, SERVER_PAGE_SIZE);
        const pages = Math.min(first.totalPages, MAX_SERVER_PAGES);
        const rest: TrackingResponse[] = [];

        for (let current = 1; current < pages; current += 1) {
          const next = await customerService.getMyReports(
            current,
            SERVER_PAGE_SIZE
          );
          rest.push(...next.content);
        }

        if (!active) return;

        const trackings = [...first.content, ...rest];
        setError(null);
        setItems(
          trackings.map((tracking) => ({
            entry: {
              id: tracking.report.id,
              registeredAt: tracking.report.reportedAt,
            },
            tracking,
          }))
        );
      } catch (err) {
        if (!active) return;
        setItems([]);
        setError(
          extractApiErrorMessage(err, 'No se pudieron obtener sus reportes.')
        );
      } finally {
        if (active) setLoadedKey(reloadKey);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return { items, loading, error, total: items.length, reload };
}
