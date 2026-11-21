"use client";

import { SearchX } from "lucide-react";
import type { BusinessSummary } from "@/types/business";
import { BusinessGrid } from "@/components/business/business-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

export function SearchResults({
  results,
  visible,
  onShowMore,
  query,
  hasFilters,
  onReset,
}: {
  results: BusinessSummary[];
  visible: number;
  onShowMore: () => void;
  query: string;
  hasFilters: boolean;
  onReset: () => void;
}) {
  const shown = results.slice(0, visible);
  const count = results.length;

  return (
    <div>
      <h2 className="sr-only">Resultados</h2>
      <p role="status" aria-live="polite" aria-atomic="true" className="mb-4 text-sm text-fg-muted" data-testid="results-count">
        {count === 0
          ? "Sin resultados"
          : `${count} ${count === 1 ? "negocio encontrado" : "negocios encontrados"}`}
        {query.trim() && count > 0 && (
          <>
            {" "}
            para <span className="font-semibold text-fg">“{query.trim()}”</span>
          </>
        )}
      </p>

      {count === 0 ? (
        <EmptyState
          icon={<SearchX aria-hidden className="size-7" />}
          title="No encontramos negocios con esos criterios"
          description="Probá con otras palabras, revisá la ortografía o quitá algunos filtros."
        >
          {(hasFilters || query) && (
            <button type="button" onClick={onReset} className={buttonClasses("secondary", "md", "mt-6")}>
              Limpiar búsqueda y filtros
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          <BusinessGrid businesses={shown} priorityCount={3} />
          {count > shown.length && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <button type="button" onClick={onShowMore} className={buttonClasses("secondary", "lg")}>
                Mostrar más
              </button>
              <p className="text-xs text-fg-subtle">
                Mostrando {shown.length} de {count}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
