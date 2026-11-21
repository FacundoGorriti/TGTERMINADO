import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";
import { getCategories } from "@/lib/catalog/categories";
import { getVisibleBusinesses } from "@/lib/catalog";

export const dynamic = "force-static";

/** Sitemap generado en el build. Excluye registros de demostración y favoritos (no indexables). */
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
    ...businesses.map((b) => ({
      url: `${base}/negocios/${b.slug}/`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
