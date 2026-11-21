import type { NextConfig } from "next";

/**
 * TARTAGAL GO se exporta como sitio 100% estático (`out/`).
 * - No hay servidor Next.js en ejecución, rutas API ni Server Actions.
 * - Las cabeceras de seguridad se definen en `vercel.json` (las `headers()` de Next
 *   no se aplican en modo export) y la CSP por página se inyecta en
 *   `scripts/postbuild-csp.mjs`. Ver docs/SECURITY.md.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // La optimización de imágenes de Next requiere servidor; en export se sirven
    // imágenes locales ya optimizadas (SVG/WebP/AVIF) con dimensiones explícitas.
    unoptimized: true,
  },
};

export default nextConfig;
