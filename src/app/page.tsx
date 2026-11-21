import Link from "next/link";
import { ArrowRight, Compass, Globe, MapPin, Search, Store } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { getCategories, getSubcategory } from "@/lib/catalog/categories";
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

/** Accesos de descubrimiento: enlazan a búsquedas reales del directorio. */
const DISCOVER = [
  { label: "Farmacias", sub: "farmacias" },
  { label: "Dónde comer", cat: "gastronomia" },
  { label: "Dónde alojarse", cat: "hoteleria-y-turismo" },
  { label: "Talleres mecánicos", sub: "talleres-mecanicos" },
  { label: "Ferreterías", sub: "ferreterias" },
  { label: "Profesionales", cat: "servicios-profesionales" },
  { label: "Emprendimientos locales", cat: "emprendimientos" },
  { label: "Cursos y clases", cat: "educacion" },
] as const;

const STEPS = [
  { icon: Search, title: "Buscá", text: "Escribí lo que necesitás o recorré los rubros. La búsqueda funciona al instante y sin registrarte." },
  { icon: Store, title: "Entrá", text: "Cada negocio tiene su propia web: tocá la tarjeta y entrás directo a su carta, sus servicios o su catálogo." },
  { icon: Globe, title: "Pedí", text: "Desde su web armás el pedido o la consulta y lo mandás por WhatsApp. Guardalo en favoritos para volver." },
];

export default function HomePage() {
  const categories = getCategories();
  const counts = getCategoryCounts();
  const total = getVisibleBusinesses().length;
  const featured = getFeaturedBusinesses(3).map(toSummary);
  const recent = getRecentBusinesses(6).map(toSummary);
  const activeCategories = Object.values(counts).filter((n) => n > 0).length;

  return (
    <>
      {/* HERO */}
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[#090b0f] text-ivory">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_80%_-10%,#315d91_0%,#101d35_40%,#090b0f_75%)]" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#f5f2ea_1px,transparent_1px),linear-gradient(90deg,#f5f2ea_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
        />
        <div className="container-page pt-12 pb-14 sm:pt-20 sm:pb-24 lg:pt-24">
          <div className="max-w-3xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-ivory/80">
              <MapPin aria-hidden className="size-3.5" />
              {siteConfig.location.mainCity}, {siteConfig.location.province}
            </p>
            <h1 id="hero-title" className="mt-5 text-[2.35rem] leading-[1.05] font-bold sm:text-6xl lg:text-7xl">
              Todo {siteConfig.location.mainCity},<br className="hidden sm:block" /> <span className="text-[#9cbde6]">a un toque.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-ivory/75 sm:text-lg">
              Comercios, profesionales, servicios y emprendimientos de la ciudad, reunidos en un directorio digital claro, rápido y confiable.
            </p>
          </div>
          <div className="mt-8 max-w-2xl [&_input]:border-transparent [&_input]:shadow-raised">
            <SearchBar size="lg" placeholder="Farmacia, café, ferretería…" />
          </div>
          <p className="mt-4 text-sm text-ivory/60">
            {pluralize(total, "negocio publicado", "negocios publicados")} · {pluralize(categories.length, "rubro", "rubros")}
            {activeCategories > 0 && ` · ${pluralize(activeCategories, "rubro con negocios", "rubros con negocios")}`}
          </p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section aria-labelledby="rubros-title" className="container-page pt-12 sm:pt-16">
        <SectionHeading
          id="rubros-title"
          eyebrow="Rubros"
          title="Explorá por categoría"
          action={{ href: "/categorias/", label: "Ver todas" }}
        />
        <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {categories.map((c) => (
            <li key={c.id} className="w-32 shrink-0 snap-start sm:w-auto">
              <CategoryCard category={c} count={counts[c.id] ?? 0} variant="compact" />
            </li>
          ))}
        </ul>
      </section>

      {/* DESTACADOS — solo los marcados explícitamente */}
      {featured.length > 0 && (
        <section aria-labelledby="destacados-title" className="container-page pt-14 sm:pt-20">
          <SectionHeading id="destacados-title" eyebrow="Selección" title="Destacados" description="Negocios marcados como destacados en el catálogo." />
          <BusinessGrid businesses={featured} />
        </section>
      )}

      {/* RECIENTES */}
      <section aria-labelledby="recientes-title" className="container-page pt-14 sm:pt-20">
        <SectionHeading
          id="recientes-title"
          eyebrow="Novedades"
          title="Recién incorporados"
          description="Los últimos negocios sumados al directorio, por fecha de incorporación."
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

      {/* DESCUBRIMIENTO */}
      <section aria-labelledby="descubrir-title" className="container-page pt-14 sm:pt-20">
        <div className="rounded-[calc(var(--radius-card)*1.4)] border border-line bg-bg-subtle p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-fg">
              <Compass aria-hidden className="size-5" />
            </span>
            <h2 id="descubrir-title" className="text-2xl font-bold text-fg sm:text-3xl">
              ¿Qué estás buscando hoy?
            </h2>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {DISCOVER.map((d) => {
              const href = "sub" in d ? `/explorar/?sub=${d.sub}` : `/categorias/${d.cat}/`;
              const valid = "sub" in d ? Boolean(getSubcategory(d.sub)) : categories.some((c) => c.id === d.cat);
              if (!valid) return null;
              return (
                <li key={d.label}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-text"
                  >
                    {d.label}
                    <ArrowRight aria-hidden className="size-4 text-fg-subtle" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section aria-labelledby="como-title" className="container-page pt-14 sm:pt-20">
        <SectionHeading id="como-title" eyebrow="Cómo funciona" title="Simple para vos, visible para tu ciudad" />
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card">
              <span className="absolute top-5 right-6 font-display text-5xl font-bold text-fg/[0.06]" aria-hidden>
                {i + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent-text">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg">
                <span className="sr-only">Paso {i + 1}: </span>
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-fg-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-title" className="container-page pt-14 sm:pt-20">
        <div className="relative isolate overflow-hidden rounded-[calc(var(--radius-card)*1.4)] bg-[#101d35] px-6 py-10 text-ivory sm:px-12 sm:py-14">
          <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-[#315d91]/40 blur-3xl" />
          <BrandMark className="size-10" />
          <h2 id="cta-title" className="mt-5 max-w-xl text-2xl font-bold sm:text-4xl">
            ¿Tenés un negocio en {siteConfig.location.mainCity}?
          </h2>
          <p className="mt-3 max-w-xl text-ivory/75">
            Sumalo al directorio y conectalo con su sitio web, WhatsApp y ubicación. Te contamos cómo funciona la incorporación.
          </p>
          <Link href="/sumar-negocio/" className={buttonClasses("inverse", "lg", "mt-7")}>
            Sumar mi negocio
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
