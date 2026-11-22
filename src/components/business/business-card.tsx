import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { BusinessSummary } from "@/types/business";
import { FavoriteButton } from "@/components/business/favorite-button";
import { Badge, DemoBadge } from "@/components/ui/primitives";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { cn } from "@/lib/utils/cn";

export function BusinessCard({ business, priority = false, headingLevel = 3 }: { business: BusinessSummary; priority?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-card",
        "transition-[border-color,transform,box-shadow] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-accent hover:shadow-raised",
      )}
      data-testid="business-card"
    >
      <div className="relative overflow-hidden [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-[var(--ease-out-soft)] group-hover:[&_img]:scale-[1.05]">
        {business.coverImage ? (
          <ResponsiveImage src={business.coverImage} alt="" ratio="16/9" priority={priority} />
        ) : (
          <div aria-hidden className="grid-lines aspect-video bg-ink" />
        )}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton slug={business.slug} name={business.name} />
        </div>
        {business.demo && <DemoBadge className="absolute top-3 left-3 z-10" />}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="relative z-[1] -mt-11 mb-3 flex items-end gap-3 pointer-events-none">
          {business.logo ? (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-surface bg-surface shadow-raised transition-transform duration-300 group-hover:-rotate-3">
              <Image src={business.logo} alt="" fill sizes="56px" className="object-cover" />
            </span>
          ) : (
            <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl border-[3px] border-surface bg-accent font-display text-lg font-bold text-accent-fg">
              {business.name.charAt(0)}
            </span>
          )}
        </div>

        <p className="text-[0.7rem] font-bold tracking-[0.16em] text-fg-subtle uppercase">{business.subcategoryName}</p>
        <Heading className="mt-1.5 font-display text-xl leading-tight font-bold text-fg">
          {/* Abre la web propia del negocio en la misma pestaña. */}
          <a href={business.websiteUrl} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none" data-testid="business-link">
            {business.name}
            <span className="sr-only"> (abre su sitio web)</span>
          </a>
        </Heading>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-fg-muted">{business.shortDescription}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge>
            <MapPin aria-hidden className="size-3.5" />
            {business.city}
          </Badge>
          {business.featured && <Badge tone="neutral">Destacado</Badge>}
          <span aria-hidden className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full bg-ink pr-1.5 pl-3.5 text-sm font-semibold text-ivory transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-fg dark:bg-surface-2">
            Ver la web
            <span className="grid size-6 place-items-center rounded-full bg-lime text-ink transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="size-3.5" />
            </span>
          </span>
        </div>
      </div>
      {/* Indicador de foco para el enlace que cubre toda la tarjeta */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-[var(--t-focus)] group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}

export function BusinessGrid({ businesses, priorityCount = 0 }: { businesses: BusinessSummary[]; priorityCount?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {businesses.map((b, i) => (
        <li key={b.slug}>
          <BusinessCard business={b} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
