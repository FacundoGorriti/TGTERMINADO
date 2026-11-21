/**
 * CONFIGURACIÓN CENTRAL DE TARTAGAL GO
 * ---------------------------------------------------------------------------
 * Todos los valores personalizables del sitio viven aquí. Los valores que
 * dependen del despliegue se leen de variables PÚBLICAS (`NEXT_PUBLIC_*`),
 * definidas en Vercel o en `.env.local`. Nunca colocar secretos en ellas.
 */

function readPublicEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeSiteUrl(value: string | null): string {
  const fallback = "http://localhost:3000";
  if (!value) return fallback;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return fallback;
    }
    return url.origin;
  } catch {
    return fallback;
  }
}

/* Las variables NEXT_PUBLIC_* deben leerse con acceso literal para que Next.js las incruste. */
const explicitSiteUrl = readPublicEnv(process.env.NEXT_PUBLIC_SITE_URL);
/**
 * Respaldo en Vercel: dominio de producción del proyecto (variable de sistema disponible en el build,
 * ej. "tgterminado.vercel.app"). Permite que el primer despliegue funcione sin configuración;
 * al tener dominio propio, definir NEXT_PUBLIC_SITE_URL.
 */
const vercelProductionHost = readPublicEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL);
const envSiteUrl = explicitSiteUrl ?? (vercelProductionHost ? `https://${vercelProductionHost}` : null);
const envContactEmail = readPublicEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
const envContactWhatsapp = readPublicEnv(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP);
const envShowDemo = readPublicEnv(process.env.NEXT_PUBLIC_SHOW_DEMO_BUSINESSES);

export const siteConfig = {
  name: "TARTAGAL GO",
  shortName: "Tartagal GO",
  tagline: "Tu ciudad, conectada.",
  description:
    "Directorio digital de comercios, profesionales, servicios y emprendimientos de Tartagal, Salta. Encontrá negocios locales, sus horarios, contacto y sitios web.",
  /** URL canónica sin barra final. NEXT_PUBLIC_SITE_URL o, en Vercel, el dominio de producción del proyecto. */
  url: normalizeSiteUrl(envSiteUrl),
  /** true si hay una URL base real (explícita o provista por Vercel). */
  hasConfiguredUrl: envSiteUrl !== null,
  /** true solo si se definió NEXT_PUBLIC_SITE_URL. */
  hasExplicitUrl: explicitSiteUrl !== null,
  /** Autor del sitio (crédito en el pie de página). */
  developer: { name: "Facundo Gorriti", role: "Desarrollador web" },
  locale: "es_AR",
  language: "es-AR",

  location: {
    mainCity: "Tartagal",
    province: "Salta",
    country: "Argentina",
    countryCode: "AR",
    /**
     * Localidades admitidas en el catálogo. Un negocio con otra localidad
     * no pasa la validación. Agregar aquí nuevas localidades del norte salteño.
     */
    supportedCities: [
      "Tartagal",
      "General Mosconi",
      "Aguaray",
      "Salvador Mazza",
      "Embarcación",
      "Coronel Cornejo",
      "General Ballivián",
      "Campamento Vespucio",
    ],
  },

  /**
   * Contacto público del proyecto. Si es null, las páginas muestran
   * "configuración pendiente" en lugar de inventar datos.
   */
  contact: {
    email: envContactEmail,
    /** Formato internacional, solo dígitos. Ej: 5493873000000 */
    whatsapp: envContactWhatsapp,
  },

  /** Redes oficiales de la plataforma (URLs https). Vacío hasta que existan. */
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  seo: {
    titleTemplate: "%s · TARTAGAL GO",
    defaultTitle: "TARTAGAL GO — Directorio digital de Tartagal, Salta",
    keywords: [
      "Tartagal",
      "Salta",
      "comercios Tartagal",
      "directorio Tartagal",
      "negocios Tartagal",
      "servicios Tartagal",
      "norte de Salta",
      "guía comercial",
    ],
    ogImage: "/branding/og-image.png",
  },

  navigation: {
    main: [
      { href: "/", label: "Inicio", icon: "home" },
      { href: "/explorar/", label: "Explorar", icon: "compass" },
      { href: "/categorias/", label: "Categorías", icon: "grid" },
      { href: "/favoritos/", label: "Favoritos", icon: "heart" },
    ],
    secondary: [
      { href: "/nosotros/", label: "Nosotros" },
      { href: "/sumar-negocio/", label: "Sumar mi negocio" },
      { href: "/contacto/", label: "Contacto" },
    ],
    legal: [
      { href: "/privacidad/", label: "Privacidad" },
      { href: "/terminos/", label: "Términos" },
    ],
  },

  features: {
    /** Muestra negocios ficticios de demostración (marcados `demo: true`). */
    showDemoBusinesses: envShowDemo === null ? true : envShowDemo === "true",
    favorites: true,
    share: true,
    /** Cantidad de resultados por "página" de carga progresiva en Explorar. */
    pageSize: 24,
    /** Límite de favoritos guardados en el navegador. */
    maxFavorites: 100,
  },
} as const;

export type NavIcon = (typeof siteConfig.navigation.main)[number]["icon"];
