/**
 * Indice local de reportes creados desde este navegador.
 *
 * El backend no expone un listado de reportes por cliente, por lo que
 * guardamos UNICAMENTE los UUID que el backend devolvio al registrar cada
 * reporte. El estado siempre se consulta con GET /api/v1/reports/{id}.
 *
 * No contiene datos de negocio inventados: solo identificadores reales.
 */

const STORAGE_KEY = 'lds_my_reports_v1';
const MAX_ENTRIES = 50;

export interface MyReportEntry {
  id: string;
  registeredAt: string;
}

function safeParse(raw: string | null): MyReportEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is MyReportEntry => {
      if (typeof item !== 'object' || item === null) return false;
      const candidate = item as Partial<MyReportEntry>;
      return (
        typeof candidate.id === 'string' &&
        candidate.id.length > 0 &&
        typeof candidate.registeredAt === 'string'
      );
    });
  } catch {
    return [];
  }
}

export function listMyReports(): MyReportEntry[] {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function addMyReport(id: string): void {
  try {
    const current = listMyReports().filter((entry) => entry.id !== id);
    const next: MyReportEntry[] = [
      { id, registeredAt: new Date().toISOString() },
      ...current,
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Si el almacenamiento no esta disponible, el reporte ya fue creado en
    // el backend; solo se pierde el acceso rapido desde esta lista local.
  }
}

export function removeMyReport(id: string): void {
  try {
    const next = listMyReports().filter((entry) => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento local la lista simplemente no persiste.
  }
}
