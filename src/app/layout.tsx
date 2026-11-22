import type { Metadata, Viewport } from "next";
import { Inter, Unbounded } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/data/site-config";
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNavigation } from "@/components/navigation/navigation";
import { BackToTop } from "@/components/ui/interactive";
import { JsonLd } from "@/components/seo/json-ld";
import { ChainBackground } from "@/components/brand/chain-background";

// next/font descarga las fuentes en el build y las sirve desde el propio dominio (autohospedadas).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.seo.defaultTitle, template: siteConfig.seo.titleTemplate },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.seo.keywords],
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { capable: true, title: siteConfig.shortName, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#07080b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <head>
        {/* Bloqueante a propósito: aplica el tema antes del primer pintado (sin parpadeo). */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="min-h-dvh">
        <a
          href="#contenido"
          className="fixed top-2 left-2 z-[60] -translate-y-24 rounded-full bg-lime px-4 py-3 text-sm font-semibold text-ink shadow-raised transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <AppHeader />
        <main id="contenido" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        {/* Al final del body: se pinta sobre los fondos de las bandas oscuras y debajo del contenido (z-index 1+). */}
        <ChainBackground />
        <MobileBottomNavigation />
        <BackToTop />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: `${siteConfig.url}/`,
            inLanguage: siteConfig.language,
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/explorar/?q={search_term_string}` },
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </body>
    </html>
  );
}
