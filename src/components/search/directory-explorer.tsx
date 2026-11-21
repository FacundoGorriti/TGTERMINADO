"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { BusinessSummary } from "@/types/business";
import {
  applyFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  filtersToQuery,
  parseFilters,
  type DirectoryFilters,
  type FilterDomain,
  type SortOption,
} from "@/lib/search/filters";
import { CategoryFilters, ChipGroup, type FilterCategory } from "@/components/filters/category-filters";
import { FilterDrawer } from "@/components/filters/filter-drawer";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { cn } from "@/lib/utils/cn";

interface DirectoryExplorerProps {
  businesses: BusinessSummary[];
  categories: FilterCategory[];
  cities: string[];
  /** Si se indica, el explorador queda fijado a esa categoría (páginas /categorias/[slug]). */
  lockedCategory?: string;
  pageSize: number;
  searchPlaceholder?: string;
}

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevancia",
  az: "Nombre (A-Z)",
  recent: "Incorporación más reciente",
};

export function DirectoryExplorer({ businesses, categories, cities, lockedCategory, pageSize, searchPlaceholder }: DirectoryExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const domain: FilterDomain = useMemo(() => {
    const subcategoryParent = new Map<string, string>();
    for (const c of categories) for (const s of c.subcategories) subcategoryParent.set(s.id, c.id);
    return { categoryIds: new Set(categories.map((c) => c.id)), subcategoryParent, cities: new Set(cities) };
  }, [categories, cities]);

  const base = useMemo(() => (lockedCategory ? { category: lockedCategory } : {}), [lockedCategory]);
  // El HTML estático se prerenderiza con los filtros vacíos (listado completo, bueno para LCP y SEO).
  // Al montar, se aplican los filtros de la URL. No se usa useSearchParams para evitar
  // que todo el explorador se renderice solo en el cliente.
  const [filters, setFilters] = useState<DirectoryFilters>(() => ({ ...EMPTY_FILTERS, ...base }));
  const [visible, setVisible] = useState(pageSize);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredFilters = useDeferredValue(filters);

  // URL → filtros: al montar y al navegar atrás/adelante.
  useEffect(() => {
    const readUrl = () => setFilters(parseFilters(new URLSearchParams(window.location.search), domain, base));
    if (window.location.search) readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, [domain, base]);

  // Filtros → URL (búsquedas compartibles). El texto se escribe con debounce.
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      const query = filtersToQuery(filters, Boolean(lockedCategory));
      if (query !== window.location.search) router.replace(`${pathname}${query}`, { scroll: false });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [filters, lockedCategory, pathname, router]);

  const update = useCallback((patch: Partial<DirectoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setVisible(pageSize);
  }, [pageSize]);

  const reset = useCallback(() => {
    setFilters((prev) => ({ ...EMPTY_FILTERS, q: prev.q, ...base }));
    setVisible(pageSize);
  }, [base, pageSize]);

  const results = useMemo(() => applyFilters(businesses, deferredFilters), [businesses, deferredFilters]);
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of businesses) counts[b.subcategoryId] = (counts[b.subcategoryId] ?? 0) + 1;
    return counts;
  }, [businesses]);

  const activeCount = countActiveFilters(filters, Boolean(lockedCategory));
  const stale = deferredFilters !== filters;

  const filterControls = (
    <div className="space-y-6">
      <CategoryFilters
        categories={categories}
        category={filters.category}
        subcategory={filters.subcategory}
        showCategories={!lockedCategory}
        onCategoryChange={(category) => update({ category })}
        onSubcategoryChange={(subcategory) => update({ subcategory })}
        subcategoryCounts={subcategoryCounts}
      />
      {cities.length > 1 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-fg">Localidad</legend>
          <ChipGroup
            label="Localidad"
            value={filters.city}
            onChange={(city) => update({ city })}
            options={[{ id: null, label: "Todas" }, ...cities.map((c) => ({ id: c, label: c }))]}
          />
        </fieldset>
      )}
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-10">
      {/* Filtros laterales en escritorio */}
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-fg">Filtros</h2>
            {activeCount > 0 && (
              <button type="button" onClick={reset} className="min-h-9 text-sm font-semibold text-accent-text hover:underline">
                Limpiar ({activeCount})
              </button>
            )}
          </div>
          {filterControls}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={filters.q}
            onValueChange={(q) => update({ q })}
            placeholder={searchPlaceholder}
            className="flex-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-fg lg:hidden"
              aria-haspopup="dialog"
            >
              <SlidersHorizontal aria-hidden className="size-4" />
              Filtros
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-accent text-[0.7rem] text-accent-fg">
                  {activeCount}
                  <span className="sr-only"> activos</span>
                </span>
              )}
            </button>
            <label className="relative flex-1 sm:flex-none">
              <span className="sr-only">Ordenar resultados</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortOption })}
                className="h-12 w-full appearance-none rounded-full border border-line-strong bg-surface pr-9 pl-4 text-sm font-semibold text-fg sm:w-auto"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-fg-subtle">
                ▼
              </span>
            </label>
          </div>
        </div>

        {/* Rubros como chips desplazables en móvil y tablet */}
        {!lockedCategory && (
          <div className="mt-4 lg:hidden">
            <ChipGroup
              label="Filtrar por rubro"
              scroll
              value={filters.category}
              onChange={(category) => update({ category, subcategory: null })}
              options={[{ id: null, label: "Todos" }, ...categories.map((c) => ({ id: c.id, label: c.name }))]}
            />
          </div>
        )}
        {lockedCategory && (
          <div className="mt-4 lg:hidden">
            <ChipGroup
              label="Filtrar por subrubro"
              scroll
              value={filters.subcategory}
              onChange={(subcategory) => update({ subcategory })}
              options={[
                { id: null, label: "Todos" },
                ...(categories.find((c) => c.id === lockedCategory)?.subcategories ?? []).map((s) => ({
                  id: s.id,
                  label: s.name,
                  count: subcategoryCounts[s.id],
                })),
              ]}
            />
          </div>
        )}

        <div className={cn("mt-6 transition-opacity", stale && "opacity-70")}>
          <SearchResults
            results={results}
            visible={visible}
            onShowMore={() => setVisible((v) => v + pageSize)}
            query={deferredFilters.q}
            hasFilters={activeCount > 0}
            onReset={() => {
              setFilters({ ...EMPTY_FILTERS, ...base });
              setVisible(pageSize);
            }}
          />
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onReset={reset} resultCount={results.length}>
        {filterControls}
      </FilterDrawer>
    </div>
  );
}
