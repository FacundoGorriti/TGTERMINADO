import { Mail, MessageCircle, Settings } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { buildMailtoHref, buildWhatsAppHref } from "@/lib/security/urls";
import { buttonClasses } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";

/** Contenedor tipográfico para páginas de texto (legales, institucionales). */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-4 text-fg-muted [&_a]:font-semibold [&_a]:text-accent-text [&_a]:underline [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-fg [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg [&_li]:pl-1 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}

/** Marcador visible de información legal pendiente de completar antes de producción. */
export function Pending({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-warning-soft px-1.5 py-0.5 font-semibold text-warning ring-1 ring-warning/30">
      [Pendiente: {children}]
    </mark>
  );
}

/**
 * Canales de contacto del proyecto, configurados por variables públicas.
 * Si no hay ninguno configurado se muestra un estado de configuración pendiente:
 * nunca se inventan contactos ni se simula el envío de formularios.
 */
export function ContactChannels({ subject, whatsappText }: { subject: string; whatsappText: string }) {
  const mail = buildMailtoHref(siteConfig.contact.email, subject);
  const wa = buildWhatsAppHref(siteConfig.contact.whatsapp, whatsappText);

  if (!mail && !wa) {
    return (
      <div data-testid="contact-pending">
        <Notice tone="warning" title="Canal de contacto en configuración">
          <p>
            Todavía no se publicó un medio de contacto oficial de {siteConfig.name}. Volvé a consultar pronto.
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-xs">
            <Settings aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            Para el administrador: definir NEXT_PUBLIC_CONTACT_EMAIL y/o NEXT_PUBLIC_CONTACT_WHATSAPP (ver docs/DEPLOYMENT.md).
          </p>
        </Notice>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row" data-testid="contact-channels">
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses("whatsapp", "lg")}>
          <MessageCircle aria-hidden className="size-5" />
          Escribir por WhatsApp
          <span className="sr-only"> (abre en una pestaña nueva)</span>
        </a>
      )}
      {mail && (
        <a href={mail} className={buttonClasses(wa ? "secondary" : "primary", "lg")}>
          <Mail aria-hidden className="size-5" />
          Enviar un correo
        </a>
      )}
    </div>
  );
}
