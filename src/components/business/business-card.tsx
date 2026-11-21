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
        "transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-raised",
      )}
      data-testid="business-card"
    >
      <div className="relative">
        {business.coverImage ? (
          <ResponsiveImage src={business.coverImage} alt="" ratio="16/9" priority={priority} />
        ) : (
          <div aria-hidden className="aspect-video bg-gradient-to-br from-midnight to-ink" />
        )}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton slug={business.slug} name={business.name} />
        </div>
        {business.demo && <DemoBadge className="absolute top-3 left-3 z-10" />}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="relative z-[1] -mt-11 mb-3 flex items-end gap-3 pointer-events-none">
          {business.logo ? (
            <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl border-2 border-surface bg-surface shadow-card">
              <Image src={business.logo} alt="" fill sizes="56px" className="object-cover" />
            </span>
          ) : (
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-surface bg-accent font-display text-lg font-bold text-accent-fg">
              {business.name.charAt(0)}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold tracking-wide text-accent-text uppercase">{business.subcategoryName}</p>
        <Heading className="mt-1 text-lg leading-snug font-semibold text-fg">
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
          <span aria-hidden className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent-text transition-transform duration-200 group-hover:translate-x-0.5">
            Ver la web
            <ArrowUpRight className="size-4" />
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
