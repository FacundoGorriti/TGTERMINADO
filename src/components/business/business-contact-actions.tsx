import { ArrowUpRight, Globe, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Business } from "@/lib/catalog/schema";
import { buttonClasses } from "@/components/ui/button";
import { buildTelHref, buildWhatsAppHref, displayHost, safeHttpsUrl, safeTrustedUrl } from "@/lib/security/urls";
import { siteConfig } from "@/data/site-config";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.2Z" />
    </svg>
  );
}

export interface ContactLinks {
  website: string | null;
  whatsapp: string | null;
  phone: string | null;
  maps: string | null;
  instagram: string | null;
  facebook: string | null;
}

/** Todas las URLs pasan por el validador central: un enlace inválido simplemente no se muestra. */
export function getContactLinks(b: Business): ContactLinks {
  return {
    website: safeHttpsUrl(b.websiteUrl),
    whatsapp: buildWhatsAppHref(b.whatsapp, `Hola, los encontré en ${siteConfig.name}.`),
    phone: buildTelHref(b.publicPhone),
    maps: safeTrustedUrl(b.mapsUrl, "maps"),
    instagram: safeTrustedUrl(b.instagramUrl, "instagram"),
    facebook: safeTrustedUrl(b.facebookUrl, "facebook"),
  };
}

const NEW_TAB = <span className="sr-only"> (abre en una pestaña nueva)</span>;

/**
 * Acciones de contacto. Solo se renderizan las que existen y son válidas:
 * nunca se muestran botones que no funcionen.
 * Botón principal: "Visitar sitio web" si hay URL; si no, WhatsApp, llamada o mapa.
 */
export function BusinessContactActions({ business }: { business: Business }) {
  const links = getContactLinks(business);
  const actions: Array<{ key: string; href: string; label: string; icon: React.ReactNode; external: boolean; variant: "primary" | "secondary" | "whatsapp" }> = [];

  if (links.website) actions.push({ key: "web", href: links.website, label: "Visitar sitio web", icon: <Globe aria-hidden className="size-5" />, external: true, variant: "primary" });
  if (links.whatsapp) actions.push({ key: "wa", href: links.whatsapp, label: "WhatsApp", icon: <MessageCircle aria-hidden className="size-5" />, external: true, variant: "whatsapp" });
  if (links.phone) actions.push({ key: "tel", href: links.phone, label: "Llamar", icon: <Phone aria-hidden className="size-5" />, external: false, variant: "secondary" });
  if (links.maps) actions.push({ key: "map", href: links.maps, label: "Cómo llegar", icon: <MapPin aria-hidden className="size-5" />, external: true, variant: "secondary" });

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5" data-testid="contact-actions">
      {actions.map((a, i) => (
        <a
          key={a.key}
          href={a.href}
          {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={buttonClasses(i === 0 ? a.variant : a.variant === "whatsapp" ? "whatsapp" : "secondary", "lg", "w-full")}
        >
          {a.icon}
          {a.label}
          {a.key === "web" && <ArrowUpRight aria-hidden className="size-4 opacity-70" />}
          {a.external && NEW_TAB}
        </a>
      ))}
      {links.website && <p className="text-center text-xs text-fg-subtle">Sitio oficial: {displayHost(links.website)}</p>}
    </div>
  );
}

export function BusinessSocialLinks({ business }: { business: Business }) {
  const links = getContactLinks(business);
  const items = [
    links.instagram && { key: "ig", href: links.instagram, label: "Instagram", Icon: InstagramGlyph },
    links.facebook && { key: "fb", href: links.facebook, label: "Facebook", Icon: FacebookGlyph },
  ].filter(Boolean) as Array<{ key: string; href: string; label: string; Icon: typeof InstagramGlyph }>;
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ key, href, label, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-fg hover:border-accent"
          >
            <Icon className="size-4" />
            {label}
            {NEW_TAB}
          </a>
        </li>
      ))}
    </ul>
  );
}
