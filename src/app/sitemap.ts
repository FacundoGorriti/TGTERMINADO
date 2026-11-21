import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";
import { getCategories } from "@/lib/catalog/categories";
import { getVisibleBusinesses } from "@/lib/catalog";

export const dynamic = "force-static";

/**
 * Sitemap generado en el build. Cada negocio tiene su web propia (fuera de este dominio), por eso aquí
 * solo figuran las páginas del directorio. Favoritos no se indexa.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const businesses = getVisibleBusinesses().filter((b) => !b.demo);
  const latest = businesses.reduce((max, b) => (b.updatedAt > max ? b.updatedAt : max), "2026-11-21");

  const staticRoutes = ["/", "/explorar/", "/categorias/", "/nosotros/", "/sumar-negocio/", "/contacto/", "/privacidad/", "/terminos/"];
  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...getCategories().map((c) => ({
      url: `${base}/categorias/${c.id}/`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
