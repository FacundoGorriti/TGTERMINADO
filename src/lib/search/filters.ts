import type { BusinessSummary } from "@/types/business";
import { createBusinessSearch } from "@/lib/search/engine";

/**
 * Filtros del directorio y su sincronización con la URL (?q=&cat=&sub=&city=&web=1&sort=).
 * Los valores de la URL son entrada no confiable: se validan contra listas conocidas.
 */

export const SORT_OPTIONS = ["relevance", "az", "recent"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface DirectoryFilters {
  q: string;
  category: string | null;
  subcategory: string | null;
  city: string | null;
  onlyWithWebsite: boolean;
  sort: SortOption;
}

export const EMPTY_FILTERS: DirectoryFilters = {
  q: "",
  category: null,
  subcategory: null,
  city: null,
  onlyWithWebsite: false,
  sort: "relevance",
};

export interface FilterDomain {
  categoryIds: ReadonlySet<string>;
  /** subcategoría → categoría */
  subcategoryParent: ReadonlyMap<string, string>;
  cities: ReadonlySet<string>;
}

interface ParamsLike {
  get(name: string): string | null;
}

export function parseFilters(params: ParamsLike, domain: FilterDomain, base: Partial<DirectoryFilters> = {}): DirectoryFilters {
  const q = (params.get("q") ?? "").slice(0, 100);
  const catParam = params.get("cat");
  const subParam = params.get("sub");
  const cityParam = params.get("city");
  const sortParam = params.get("sort");

  let category = base.category ?? (catParam && domain.categoryIds.has(catParam) ? catParam : null);
  let subcategory = subParam && domain.subcategoryParent.has(subParam) ? subParam : null;
  if (subcategory) {
    const parent = domain.subcategoryParent.get(subcategory) ?? null;
    if (category && parent !== category) subcategory = null;
    else category = parent;
  }

  return {
    q,
    category,
    subcategory,
    city: cityParam && domain.cities.has(cityParam) ? cityParam : null,
    onlyWithWebsite: params.get("web") === "1",
    sort: SORT_OPTIONS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "relevance",
  };
}

/** Serializa filtros a query string. `omitCategory` se usa en páginas de categoría. */
export function filtersToQuery(filters: DirectoryFilters, omitCategory = false): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category && !omitCategory) params.set("cat", filters.category);
  if (filters.subcategory) params.set("sub", filters.subcategory);
  if (filters.city) params.set("city", filters.city);
  if (filters.onlyWithWebsite) params.set("web", "1");
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function countActiveFilters(filters: DirectoryFilters, omitCategory = false): number {
  return (
    (filters.category && !omitCategory ? 1 : 0) +
    (filters.subcategory ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.onlyWithWebsite ? 1 : 0)
  );
}

/** Aplica búsqueda + filtros + orden. Función pura (probada en tests/unit). */
export function applyFilters(items: readonly BusinessSummary[], filters: DirectoryFilters): BusinessSummary[] {
  const filtered = items.filter(
    (b) =>
      (!filters.category || b.categoryId === filters.category) &&
      (!filters.subcategory || b.subcategoryId === filters.subcategory) &&
      (!filters.city || b.city === filters.city) &&
      (!filters.onlyWithWebsite || b.hasWebsite),
  );

  const hasQuery = filters.q.trim().length > 0;
  const ranked = hasQuery ? createBusinessSearch(filtered).search(filters.q).map((h) => h.item) : filtered;

  const byName = (a: BusinessSummary, b: BusinessSummary) => a.name.localeCompare(b.name, "es");
  switch (filters.sort) {
    case "az":
      return [...ranked].sort(byName);
    case "recent":
      return [...ranked].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || byName(a, b));
    default:
      // Relevancia: con consulta, el orden del motor; sin consulta, destacados y luego A-Z.
      return hasQuery ? ranked : [...ranked].sort((a, b) => Number(b.featured) - Number(a.featured) || byName(a, b));
  }
}
