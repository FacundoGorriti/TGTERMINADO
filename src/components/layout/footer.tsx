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

  return (
    <footer className="mt-16 border-t border-line bg-bg-subtle sm:mt-24">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <BrandLogo />
          <p className="mt-4 text-sm text-fg-muted">
            El punto de conexión digital entre las personas y los negocios de {siteConfig.location.mainCity},{" "}
            {siteConfig.location.province}.
          </p>
          <div className="mt-6">
            <ThemeSwitcher />
          </div>
        </div>

        <nav aria-label="Rubros">
          <p className="text-sm font-semibold text-fg">Rubros</p>
          <ul className="mt-3 space-y-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorias/${c.id}/`} className="inline-flex min-h-9 items-center text-sm text-fg-muted hover:text-fg">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categorias/" className="inline-flex min-h-9 items-center text-sm font-semibold text-accent-text hover:underline">
                Ver todos los rubros
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Plataforma">
          <p className="text-sm font-semibold text-fg">Plataforma</p>
          <ul className="mt-3 space-y-1">
            {[...siteConfig.navigation.main.slice(1), ...siteConfig.navigation.secondary].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center text-sm text-fg-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-fg">Legal</p>
          <ul className="mt-3 space-y-1">
            {siteConfig.navigation.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center text-sm text-fg-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            {social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center text-sm text-fg-muted hover:text-fg"
                >
                  {s.label}
                  <span className="sr-only"> (abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Directorio de {siteConfig.location.mainCity}, {siteConfig.location.province},{" "}
            {siteConfig.location.country}.
          </p>
          <p>La información de cada negocio es responsabilidad de su titular.</p>
        </div>
      </div>
    </footer>
  );
}
