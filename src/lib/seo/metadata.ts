import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}

interface PageMetaInput {
  title?: string;
  description?: string;
  /** Ruta canónica con barra final (ej. "/explorar/"). */
  path: string;
  image?: string | null;
  /** true para páginas que no deben indexarse (ej. fichas de demostración). */
  noIndex?: boolean;
  type?: "website" | "article";
}

/** Metadata consistente: título, descripción, canonical, Open Graph y Twitter Card. */
export function buildMetadata({ title, description, path, image, noIndex, type = "website" }: PageMetaInput): Metadata {
  const desc = description ?? siteConfig.description;
  // Las imágenes SVG no son admitidas por redes sociales: se usa la imagen OG del sitio.
  const ogImage = image && !image.endsWith(".svg") ? image : siteConfig.seo.ogImage;
  const fullTitle = title ? siteConfig.seo.titleTemplate.replace("%s", title) : siteConfig.seo.defaultTitle;
  return {
    title: title ? title : { absolute: siteConfig.seo.defaultTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      url: path,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
