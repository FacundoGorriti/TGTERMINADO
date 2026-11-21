import { ArrowUpRight, Check, Clock } from "lucide-react";
import type { Business } from "@/lib/catalog/schema";
import { getProfileFields } from "@/lib/catalog/categories";
import { safeHttpsUrl } from "@/lib/security/urls";
import { groupOpeningHours } from "@/lib/utils/format";
import { buttonClasses } from "@/components/ui/button";
import { ResponsiveImage } from "@/components/ui/responsive-image";

export function DetailCard({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
      <h2 id={id} className="text-lg font-semibold text-fg">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BusinessHours({ business }: { business: Business }) {
  const rows = groupOpeningHours(business.openingHours);
  if (rows.length === 0 && !business.openingHoursNote) return null;
  return (
    <DetailCard title="Horarios" id="horarios">
      {rows.length > 0 && (
        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5 text-sm first:pt-0">
              <dt className="font-medium text-fg">{row.label}</dt>
              <dd className="text-fg-muted tabular-nums">{row.ranges.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      )}
      {business.openingHoursNote && (
        <p className="mt-3 flex items-start gap-2 text-sm text-fg-muted">
          <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
          {business.openingHoursNote}
        </p>
      )}
      <p className="mt-3 text-xs text-fg-subtle">Los horarios pueden variar. Confirmá con el comercio antes de acercarte.</p>
    </DetailCard>
  );
}

/**
 * Información contextual según el rubro (especialidad, tipo de cocina, reservas, catálogo...).
 * Los campos se definen en src/data/categories.ts: no hace falta un componente por rubro.
 */
export function BusinessAttributes({ business }: { business: Business }) {
  const fields = getProfileFields(business.categoryId, business.subcategoryId);
  const textRows: Array<{ label: string; value: string }> = [];
  const listRows: Array<{ label: string; values: string[] }> = [];
  const links: Array<{ key: string; label: string; href: string }> = [];

  for (const field of fields) {
    const value = business.attributes[field.key];
    if (value === undefined) continue;
    if (field.type === "list" && Array.isArray(value)) listRows.push({ label: field.label, values: value });
    else if (field.type === "text" && typeof value === "string") textRows.push({ label: field.label, value });
    else if (field.type === "url" && typeof value === "string") {
      const href = safeHttpsUrl(value);
      if (href) links.push({ key: field.key, label: field.actionLabel ?? field.label, href });
    }
  }

  if (textRows.length + listRows.length + links.length === 0) return null;

  return (
    <DetailCard title="Información del rubro" id="informacion-rubro">
      <div className="space-y-5">
        {textRows.length > 0 && (
          <dl className="grid gap-4 sm:grid-cols-2">
            {textRows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">{row.label}</dt>
                <dd className="mt-1 text-sm font-medium text-fg">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {listRows.map((row) => (
          <div key={row.label}>
            <h3 className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">{row.label}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {row.values.map((v) => (
                <li key={v} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm text-fg">
                  {v}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md")}>
                {l.label}
                <ArrowUpRight aria-hidden className="size-4" />
                <span className="sr-only"> (sitio externo, abre en una pestaña nueva)</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </DetailCard>
  );
}

export function BusinessFeatures({ business }: { business: Business }) {
  if (business.features.length === 0) return null;
  return (
    <DetailCard title="Servicios y características" id="caracteristicas">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {business.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-fg">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <Check aria-hidden className="size-3.5" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

export function BusinessGallery({ business }: { business: Business }) {
  if (business.gallery.length === 0) return null;
  return (
    <DetailCard title="Galería" id="galeria">
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
        {business.gallery.map((img) => (
          <li key={img.src} className="w-[80%] shrink-0 snap-start sm:w-auto">
            <ResponsiveImage src={img.src} alt={img.alt} ratio="4/3" className="rounded-2xl" sizes="(min-width: 640px) 360px, 80vw" />
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}
