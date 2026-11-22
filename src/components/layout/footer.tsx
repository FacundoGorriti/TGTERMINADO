import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { siteConfig } from "@/data/site-config";
import { getCategories } from "@/lib/catalog/categories";
import { safeHttpsUrl } from "@/lib/security/urls";

export function Footer() {
  const categories = getCategories().slice(0, 6);
  const social = [
    { label: "Instagram", href: safeHttpsUrl(siteConfig.social.instagram) },
    { label: "Facebook", href: safeHttpsUrl(siteConfig.social.facebook) },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-9 items-center text-sm text-fg-muted transition-colors hover:text-lime";

  return (
    // Siempre oscuro, como el inicio: cierra la página con la marca en grande.
    <footer data-theme="dark" className="relative z-[2] mt-20 overflow-hidden bg-ink text-fg sm:mt-28">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div aria-hidden className="absolute -top-40 right-0 size-[30rem] rounded-full bg-lime/10 blur-[120px]" />
      <div className="relative container-page grid gap-10 pt-16 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <BrandLogo />
          <p className="mt-5 text-sm text-fg-muted">
            {siteConfig.tagline} El punto de conexión digital entre las personas y los negocios de {siteConfig.location.mainCity},{" "}
            {siteConfig.location.province}.
          </p>
          <div className="mt-6">
            <ThemeSwitcher />
          </div>
        </div>

        <nav aria-label="Rubros">
          <p className="eyebrow text-fg-muted">Rubros</p>
          <ul className="mt-4 space-y-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorias/${c.id}/`} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categorias/" className="inline-flex min-h-9 items-center text-sm font-semibold text-lime hover:underline">
                Ver todos los rubros
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Plataforma">
          <p className="eyebrow text-fg-muted">Plataforma</p>
          <ul className="mt-4 space-y-1">
            {[...siteConfig.navigation.main.slice(1), ...siteConfig.navigation.secondary].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-fg-muted">Legal</p>
          <ul className="mt-4 space-y-1">
            {siteConfig.navigation.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {s.label}
                  <span className="sr-only"> (abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Marca gigante con contorno */}
      <div aria-hidden className="relative container-page select-none">
        <p className="text-outline font-display text-[clamp(2.2rem,9vw,8.4rem)] leading-[0.9] font-extrabold tracking-[-0.04em] whitespace-nowrap">
          TARTAGAL <span className="text-lime [-webkit-text-stroke-width:0]">GO</span>
        </p>
      </div>

      <div className="pb-mobile-nav relative border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-fg-subtle lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} {siteConfig.name}. Todos los derechos reservados. Directorio de {siteConfig.location.mainCity},{" "}
            {siteConfig.location.province}. La información de cada negocio es responsabilidad de su titular.
          </p>
          <p className="text-fg-muted">
            Diseño y desarrollo web por <span className="font-semibold text-fg">{siteConfig.developer.name}</span> ·{" "}
            {siteConfig.developer.role}
          </p>
        </div>
      </div>
    </footer>
  );
}
