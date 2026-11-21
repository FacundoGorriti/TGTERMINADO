import { getCategories } from "@/lib/catalog/categories";
import type { FilterCategory } from "@/components/filters/category-filters";

/** Registro de categorías reducido para enviar a componentes de cliente. */
export function getFilterCategories(): FilterCategory[] {
  return getCategories().map((c) => ({
    id: c.id,
    name: c.name,
    subcategories: c.subcategories.map((s) => ({ id: s.id, name: s.name })),
  }));
}
