import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/data/site-config";
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNavigation } from "@/components/navigation/navigation";
import { BackToTop } from "@/components/ui/interactive";
import { JsonLd } from "@/components/seo/json-ld";

// next/font descarga las fuentes en el build y las sirve desde el propio dominio (autohospedadas).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["600", "700"] });

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
    { media: "(prefers-color-scheme: light)", color: "#fcfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#090b0f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        {/* Bloqueante a propósito: aplica el tema antes del primer pintado (sin parpadeo). */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="min-h-dvh">
        <a
          href="#contenido"
          className="fixed top-2 left-2 z-[60] -translate-y-24 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-fg shadow-raised transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <AppHeader />
        <main id="contenido" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <div className="pb-mobile-nav">
          <Footer />
        </div>
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
