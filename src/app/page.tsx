import Link from "next/link";
import { ArrowRight, ArrowUpRight, Link2, MapPin, Search, Store, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { getCategories } from "@/lib/catalog/categories";
import { getCategoryCounts, getFeaturedBusinesses, getRecentBusinesses, getVisibleBusinesses, toSummary } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { BrandMark } from "@/components/brand/brand-logo";
import { BusinessGrid } from "@/components/business/business-card";
import { CategoryCard } from "@/components/categories/category-card";
import { SearchBar } from "@/components/search/search-bar";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/primitives";
import { pluralize } from "@/lib/utils/format";

export const metadata = buildMetadata({ path: "/" });

/** Búsquedas sugeridas: solo términos que hoy devuelven resultados reales. */
const SUGGESTIONS = ["pizza", "hamburguesa", "lomito", "pancho"] as const;

const STEPS = [
  { icon: Search, title: "Buscá", text: "Escribí lo que necesitás o recorré los rubros. Al instante y sin registrarte." },
  { icon: Store, title: "Entrá", text: "Cada negocio tiene su propia web: tocás la tarjeta y entrás directo a su carta o su catálogo." },
  { icon: MessageCircle, title: "Pedí", text: "Desde su web armás el pedido y lo mandás por WhatsApp. Guardalo en favoritos para volver." },
];

export default function HomePage() {
  const categories = getCategories();
  const counts = getCategoryCounts();
  const visible = getVisibleBusinesses();
  const total = visible.length;
  const featured = getFeaturedBusinesses(6).map(toSummary);
  const recent = getRecentBusinesses(6).map(toSummary);
  const sameAsFeatured = recent.length === featured.length && recent.every((r) => featured.some((f) => f.slug === r.slug));
  const searchable = visible.flatMap((b) => [b.name, b.shortDescription, b.description, ...b.keywords].join(" ").toLowerCase());
  const suggestions = SUGGESTIONS.filter((s) => searchable.some((t) => t.includes(s)));
  // Rubros con negocios primero; el más poblado ocupa la baldosa grande.
  const ordered = [...categories].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));

  return (
    <>
      {/* HERO — siempre oscuro; la cadena 3D pasa por detrás del texto */}
      <section aria-labelledby="hero-title" data-band data-theme="dark" data-chain-light="white" className="relative overflow-hidden bg-ink text-fg">
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_30%_30%,black,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-lime/15 blur-[120px]" />
        <div className="container-page flex min-h-[calc(100svh-3.5rem)] flex-col justify-center pt-14 pb-16 sm:pt-20 md:min-h-[46rem] lg:pb-24">
          <div className="max-w-3xl">
            <p className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/70 px-3.5 py-2 text-xs font-semibold text-fg-muted backdrop-blur">
              <span className="animate-pulse-dot size-2 rounded-full bg-lime" />
              <MapPin aria-hidden className="size-3.5" />
              {siteConfig.location.mainCity}, {siteConfig.location.province} · {pluralize(total, "negocio conectado", "negocios conectados")}
            </p>
            <h1 id="hero-title" className="animate-fade-up-2 mt-6 text-[clamp(2.6rem,11vw,6.2rem)] leading-[0.95] font-extrabold">
              Todo {siteConfig.location.mainCity}, <span className="text-lime">a un toque.</span>
            </h1>
            <p className="animate-fade-up-3 mt-6 max-w-xl text-base text-fg-muted sm:text-lg">
              Los negocios de la ciudad, cada uno con su propia web: mirá la carta, armá tu pedido y mandalo por WhatsApp.
            </p>
          </div>
          <div className="animate-fade-up-3 mt-9 max-w-2xl [&_input]:border-line-strong [&_input]:bg-surface/85 [&_input]:shadow-raised [&_input]:backdrop-blur">
            <SearchBar size="lg" placeholder="Pizza, hamburguesa, lomito…" />
          </div>
          {suggestions.length > 0 && (
            <div className="animate-fade-up-3 mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-fg-subtle">Probá:</span>
              {suggestions.map((s) => (
                <Link
                  key={s}
                  href={`/explorar/?q=${encodeURIComponent(s)}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-line-strong px-3.5 font-semibold text-fg-muted transition-colors hover:border-lime hover:text-lime"
                >
                  {s}
                </Link>
              ))}
            </div>
          )}
          <dl className="animate-fade-up-3 mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">Negocios</dt>
              <dd className="mt-1 font-display text-[clamp(1.6rem,7vw,2.25rem)] font-bold whitespace-nowrap">{total}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">Rubros</dt>
              <dd className="mt-1 font-display text-[clamp(1.6rem,7vw,2.25rem)] font-bold whitespace-nowrap">{categories.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">Con web propia</dt>
              <dd className="mt-1 font-display text-[clamp(1.6rem,7vw,2.25rem)] font-bold whitespace-nowrap text-lime">{total > 0 ? "100%" : "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CINTA — los negocios conectados, como eslabones */}
      {total > 0 && (
        <div aria-hidden data-decorative className="overflow-hidden border-y border-ink bg-lime py-3.5 text-ink">
          <div className="animate-marquee flex w-max">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex shrink-0 items-center">
                {Array.from({ length: Math.max(2, Math.ceil(8 / total)) })
                  .flatMap(() => visible)
                  .map((b, i) => (
                    <span key={`${b.slug}-${i}`} className="flex items-center">
                      <span className="px-5 font-display text-lg font-bold whitespace-nowrap sm:text-xl">{b.name}</span>
                      <Link2 className="size-5" />
                    </span>
                  ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RUBROS — baldosas tipo bento */}
      <section aria-labelledby="rubros-title" data-chain-light="lime" className="container-page pt-16 sm:pt-24">
        <SectionHeading id="rubros-title" eyebrow="Rubros" title="Explorá por categoría" action={{ href: "/categorias/", label: "Ver todos los rubros" }} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {ordered.map((c, i) => (
            <li key={c.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <CategoryCard category={c} count={counts[c.id] ?? 0} variant={i === 0 ? "feature" : "compact"} />
            </li>
          ))}
        </ul>
      </section>

      {/* DESTACADOS */}
      {featured.length > 0 && (
        <section aria-labelledby="destacados-title" data-chain-light="cyan" className="container-page pt-16 sm:pt-24">
          <SectionHeading
            id="destacados-title"
            eyebrow="Selección"
            title="Destacados"
            description="Tocá una tarjeta y entrás directo a la web del negocio."
            action={{ href: "/explorar/", label: "Ver todos" }}
          />
          <BusinessGrid businesses={featured} priorityCount={0} />
        </section>
      )}

      {/* RECIENTES — solo si aporta algo distinto a Destacados */}
      {(!sameAsFeatured || featured.length === 0) && (
        <section aria-labelledby="recientes-title" data-chain-light="white" className="container-page pt-16 sm:pt-24">
          <SectionHeading
            id="recientes-title"
            eyebrow="Novedades"
            title="Recién incorporados"
            description="Los últimos negocios sumados al directorio."
            action={total > 0 ? { href: "/explorar/?sort=recent", label: "Ver todos" } : undefined}
          />
          {recent.length > 0 ? (
            <BusinessGrid businesses={recent} />
          ) : (
            <EmptyState
              title="El directorio está comenzando"
              description="Todavía no hay negocios publicados. ¿Tenés un comercio en la ciudad? Sumalo y sé de los primeros."
              action={{ href: "/sumar-negocio/", label: "Sumar mi negocio" }}
            />
          )}
        </section>
      )}

      {/* CÓMO FUNCIONA */}
      <section aria-labelledby="como-title" data-chain-light="lime" className="container-page pt-16 sm:pt-24">
        <SectionHeading id="como-title" eyebrow="Cómo funciona" title="Buscá, entrá, pedí." />
        <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card sm:p-7">
              <span aria-hidden className="text-outline absolute -top-3 -right-1 font-display text-[6.5rem] leading-none font-extrabold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative grid size-12 place-items-center rounded-2xl bg-ink text-lime dark:bg-lime dark:text-ink">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="relative mt-5 text-xl font-bold text-fg">
                <span className="sr-only">Paso {i + 1}: </span>
                {title}
              </h3>
              <p className="relative mt-2 text-fg-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA — siempre oscuro */}
      <section aria-labelledby="cta-title" data-chain-light="lime" className="container-page pt-16 pb-6 sm:pt-24">
        <div data-theme="dark" className="relative overflow-hidden rounded-[2rem] bg-ink text-fg">
          <div aria-hidden className="grid-lines absolute inset-0 opacity-70" />
          <div aria-hidden className="absolute -right-24 -bottom-32 size-[26rem] rounded-full bg-lime/20 blur-[100px]" />
          <div className="relative px-6 py-12 sm:px-14 sm:py-16">
            <BrandMark className="size-12" />
            <h2 id="cta-title" className="mt-6 max-w-2xl text-[clamp(1.8rem,6vw,3.4rem)] leading-[1.02] font-extrabold">
              ¿Tenés un negocio en {siteConfig.location.mainCity}? <span className="text-lime">Sumate a la cadena.</span>
            </h2>
            <p className="mt-4 max-w-xl text-fg-muted sm:text-lg">
              Te hacemos una web propia para tu negocio, lista para recibir pedidos por WhatsApp, y aparecés en TARTAGAL GO.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sumar-negocio/" className={buttonClasses("primary", "lg")}>
                Sumar mi negocio
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link href="/nosotros/" className={buttonClasses("secondary", "lg")}>
                Qué es {siteConfig.name}
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
