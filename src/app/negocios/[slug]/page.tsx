import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { getCategory, getSchemaType, getSubcategory } from "@/lib/catalog/categories";
import { getBusinessBySlug, getRelatedBusinesses, getVisibleBusinesses, toSummary } from "@/lib/catalog";
import type { Business } from "@/lib/catalog/schema";
import { absoluteUrl, buildMetadata } from "@/lib/seo/metadata";
import { formatDate, SCHEMA_DAYS } from "@/lib/utils/format";
import { BusinessGrid } from "@/components/business/business-card";
import { BusinessContactActions, BusinessSocialLinks, getContactLinks } from "@/components/business/business-contact-actions";
import { BusinessAttributes, BusinessFeatures, BusinessGallery, BusinessHours, DetailCard } from "@/components/business/business-details";
import { FavoriteButton } from "@/components/business/favorite-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShareButton } from "@/components/ui/interactive";
import { DemoBadge, Notice, SectionHeading } from "@/components/ui/primitives";
import { ResponsiveImage } from "@/components/ui/responsive-image";

export const dynamicParams = false;

/** Marcador usado solo cuando el catálogo está vacío: `output: "export"` exige al menos un parámetro. */
const EMPTY_PLACEHOLDER = "sin-negocios";

export function generateStaticParams() {
  const slugs = getVisibleBusinesses().map((b) => ({ slug: b.slug }));
  return slugs.length > 0 ? slugs : [{ slug: EMPTY_PLACEHOLDER }];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = getBusinessBySlug(slug);
  if (!b) return { title: "Negocio no encontrado", robots: { index: false } };
  const sub = getSubcategory(b.subcategoryId)?.subcategory;
  return buildMetadata({
    title: `${b.name} — ${sub?.name ?? "Negocio"} en ${b.city}`,
    description: b.shortDescription,
    path: `/negocios/${b.slug}/`,
    image: b.coverImage,
    // Los registros de demostración nunca se indexan como negocios reales.
    noIndex: b.demo,
  });
}

/** LocalBusiness (o subtipo) solo con datos reales del catálogo: sin reseñas, precios ni coordenadas inventadas. */
function businessJsonLd(b: Business) {
  const links = getContactLinks(b);
  const sameAs = [links.instagram, links.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": getSchemaType(b.categoryId, b.subcategoryId),
    "@id": absoluteUrl(`/negocios/${b.slug}/#negocio`),
    name: b.name,
    description: b.shortDescription,
    url: links.website ?? absoluteUrl(`/negocios/${b.slug}/`),
    ...(b.coverImage && !b.coverImage.endsWith(".svg") ? { image: absoluteUrl(b.coverImage) } : {}),
    ...(b.logo && !b.logo.endsWith(".svg") ? { logo: absoluteUrl(b.logo) } : {}),
    ...(b.publicPhone ? { telephone: b.publicPhone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(b.address ? { streetAddress: b.address } : {}),
      addressLocality: b.city,
      addressRegion: b.province,
      addressCountry: siteConfig.location.countryCode,
    },
    ...(links.maps ? { hasMap: links.maps } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(b.openingHours.length
      ? {
          openingHoursSpecification: b.openingHours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days.map((d) => `https://schema.org/${SCHEMA_DAYS[d]}`),
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
  };
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const business = getBusinessBySlug(slug);
  if (!business) notFound();

  const category = getCategory(business.categoryId)!;
  const sub = getSubcategory(business.subcategoryId)!.subcategory;
  const related = getRelatedBusinesses(business, 3).map(toSummary);
  const links = getContactLinks(business);
  const hasActions = Boolean(links.website || links.whatsapp || links.phone || links.maps);
  const path = `/negocios/${business.slug}/`;

  return (
    <article>
      {!business.demo && <JsonLd data={businessJsonLd(business)} />}

      {/* PORTADA */}
      <div className="relative">
        {business.coverImage ? (
          <ResponsiveImage src={business.coverImage} alt="" ratio="21/9" priority sizes="100vw" className="max-h-[22rem] min-h-44 w-full" />
        ) : (
          <div aria-hidden className="h-44 bg-gradient-to-br from-midnight to-ink sm:h-64" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
      </div>

      <div className="container-page relative -mt-16 sm:-mt-20">
        <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-10">
          {/* CONTENIDO PRINCIPAL */}
          <div className="min-w-0">
            <div className="flex items-end gap-4">
              {business.logo ? (
                <span className="relative size-24 shrink-0 overflow-hidden rounded-3xl border-4 border-bg bg-surface shadow-raised sm:size-28">
                  <Image src={business.logo} alt={`Logotipo de ${business.name}`} fill sizes="112px" className="object-cover" priority />
                </span>
              ) : (
                <span aria-hidden className="grid size-24 shrink-0 place-items-center rounded-3xl border-4 border-bg bg-accent font-display text-4xl font-bold text-accent-fg shadow-raised sm:size-28">
                  {business.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="mt-5">
              <Breadcrumbs
                items={[
                  { name: category.name, path: `/categorias/${category.id}/` },
                  { name: business.name, path },
                ]}
              />
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-wide text-accent-text uppercase">{sub.name}</p>
                {business.demo && <DemoBadge />}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-fg sm:text-4xl lg:text-5xl">{business.name}</h1>
              <p className="mt-3 text-lg text-fg-muted">{business.shortDescription}</p>
              <p className="mt-3 flex items-start gap-1.5 text-sm text-fg-muted">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  {business.address ? `${business.address}, ` : ""}
                  {business.city}, {business.province}
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <FavoriteButton slug={business.slug} name={business.name} variant="full" />
                <ShareButton title={business.name} text={business.shortDescription} url={path} />
              </div>
            </div>

            {business.demo && (
              <div className="mt-6">
                <Notice tone="warning" title="Registro ficticio de demostración">
                  Este negocio no existe. Se incluye para mostrar cómo se ve una ficha y puede eliminarse borrando su archivo en
                  src/data/businesses/ o desactivando NEXT_PUBLIC_SHOW_DEMO_BUSINESSES.
                </Notice>
              </div>
            )}

            {/* Acciones (móvil): antes del detalle para tenerlas a mano */}
            <div className="mt-6 lg:hidden">
              <BusinessContactActions business={business} />
            </div>

            <div className="mt-8 space-y-5">
              <DetailCard title={`Sobre ${business.name}`} id="descripcion">
                <p className="whitespace-pre-line text-fg-muted">{business.description}</p>
                <BusinessSocialLinks business={business} />
              </DetailCard>
              <BusinessAttributes business={business} />
              <BusinessFeatures business={business} />
              <BusinessHours business={business} />
              <BusinessGallery business={business} />
            </div>
          </div>

          {/* LATERAL (escritorio) */}
          <aside aria-label="Contacto" className="mt-8 hidden lg:mt-24 lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
                <h2 className="mb-4 text-base font-semibold text-fg">Contacto</h2>
                {hasActions ? (
                  <BusinessContactActions business={business} />
                ) : (
                  <p className="text-sm text-fg-muted">Este negocio todavía no publicó medios de contacto en el directorio.</p>
                )}
              </div>
              <p className="px-1 text-xs text-fg-subtle">
                Incorporado el {formatDate(business.publishedAt)}
                {business.updatedAt !== business.publishedAt && ` · Actualizado el ${formatDate(business.updatedAt)}`}
              </p>
            </div>
          </aside>
        </div>

        {!hasActions && (
          <p className="mt-6 text-sm text-fg-muted lg:hidden">Este negocio todavía no publicó medios de contacto en el directorio.</p>
        )}
        <p className="mt-6 text-xs text-fg-subtle lg:hidden">
          Incorporado el {formatDate(business.publishedAt)}
          {business.updatedAt !== business.publishedAt && ` · Actualizado el ${formatDate(business.updatedAt)}`}
        </p>

        {related.length > 0 && (
          <section aria-labelledby="relacionados" className="mt-14 sm:mt-20">
            <SectionHeading id="relacionados" eyebrow={category.name} title="Negocios relacionados" action={{ href: `/categorias/${category.id}/`, label: `Ver ${category.name.toLowerCase()}` }} />
            <BusinessGrid businesses={related} />
          </section>
        )}
      </div>

    </article>
  );
}
