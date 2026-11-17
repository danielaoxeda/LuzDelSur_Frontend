interface SimilarityIndicatorProps {
  similarity: number | null;
}

/**
 * La similitud semantica la calcula el backend. Si el motor no la devuelve,
 * se informa como no disponible en lugar de estimar un valor.
 */
export function SimilarityIndicator({ similarity }: SimilarityIndicatorProps) {
  if (similarity === null || similarity === undefined) {
    return (
      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
        No disponible
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-800"
      title="Similitud semántica calculada por el backend"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {similarity.toFixed(2)}
    </span>
  );
}
