import { siteConfig } from "@/data/site-config";
import { getCategories, getCategory, getSubcategory } from "@/lib/catalog/categories";
import { loadCatalog } from "@/lib/catalog/load";
import type { Business } from "@/lib/catalog/schema";
import type { BusinessSummary } from "@/types/business";

/**
 * API de consulta del catálogo para páginas (solo en build / servidor).
 * Aplica las reglas de visibilidad: únicamente `status: "published"` y, si está
 * desactivado en site-config, se excluyen los registros de demostración.
 */

export function isVisible(b: Business, showDemo: boolean = siteConfig.features.showDemoBusinesses): boolean {
  return b.status === "published" && (showDemo || !b.demo);
}

export function getVisibleBusinesses(): Business[] {
  return loadCatalog().filter((b) => isVisible(b));
}

export function getBusinessBySlug(slug: string): Business | undefined {
  return getVisibleBusinesses().find((b) => b.slug === slug);
}

export function getBusinessesByCategory(categoryId: string): Business[] {
  return getVisibleBusinesses().filter((b) => b.categoryId === categoryId);
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of getCategories()) counts[c.id] = 0;
  for (const b of getVisibleBusinesses()) counts[b.categoryId] = (counts[b.categoryId] ?? 0) + 1;
  return counts;
}

export function getSubcategoryCounts(categoryId: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of getBusinessesByCategory(categoryId)) {
    counts[b.subcategoryId] = (counts[b.subcategoryId] ?? 0) + 1;
  }
  return counts;
}

export function byNewest(a: Business, b: Business): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.name.localeCompare(b.name, "es");
}

/** Destacados: solo los marcados explícitamente con `featured: true`. */
export function getFeaturedBusinesses(limit = 6): Business[] {
  return getVisibleBusinesses().filter((b) => b.featured).sort(byNewest).slice(0, limit);
}

/** Recientes según `publishedAt` real del catálogo. */
export function getRecentBusinesses(limit = 6): Business[] {
  return [...getVisibleBusinesses()].sort(byNewest).slice(0, limit);
}

/** Relacionados: misma subcategoría primero, luego misma categoría. */
export function getRelatedBusinesses(business: Business, limit = 3): Business[] {
  const others = getVisibleBusinesses().filter((b) => b.slug !== business.slug);
  const sameSub = others.filter((b) => b.subcategoryId === business.subcategoryId);
  const sameCat = others.filter((b) => b.categoryId === business.categoryId && b.subcategoryId !== business.subcategoryId);
  return [...sameSub.sort(byNewest), ...sameCat.sort(byNewest)].slice(0, limit);
}

export function getCities(): string[] {
  return [...new Set(getVisibleBusinesses().map((b) => b.city))].sort((a, b) => a.localeCompare(b, "es"));
}

/** Versión liviana y serializable para componentes de cliente (búsqueda, filtros, favoritos). */
export function toSummary(b: Business): BusinessSummary {
  const category = getCategory(b.categoryId);
  const sub = getSubcategory(b.subcategoryId)?.subcategory;
  const attributeText = Object.values(b.attributes).flat();
  return {
    slug: b.slug,
    name: b.name,
    shortDescription: b.shortDescription,
    categoryId: b.categoryId,
    categoryName: category?.name ?? b.categoryId,
    subcategoryId: b.subcategoryId,
    subcategoryName: sub?.name ?? b.subcategoryId,
    city: b.city,
    logo: b.logo ?? null,
    coverImage: b.coverImage ?? null,
    websiteUrl: b.websiteUrl,
    hasWebsite: Boolean(b.websiteUrl),
    hasWhatsapp: Boolean(b.whatsapp),
    featured: b.featured,
    demo: b.demo,
    publishedAt: b.publishedAt,
    searchText: {
      description: b.description,
      features: b.features,
      keywords: [...b.keywords, ...attributeText.filter((v) => !v.startsWith("https://"))],
    },
  };
}

export function getVisibleSummaries(): BusinessSummary[] {
  return getVisibleBusinesses().map(toSummary);
}
