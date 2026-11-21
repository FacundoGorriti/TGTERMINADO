import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { ContactChannels } from "@/components/layout/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Contacto",
  description: `Canales de contacto de ${siteConfig.name}.`,
  path: "/contacto/",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Hablemos" title="Contacto" description={`Consultas sobre ${siteConfig.name}, correcciones de datos o incorporación de negocios.`}>
        <Breadcrumbs items={[{ name: "Contacto", path: "/contacto/" }]} />
      </PageHeader>
      <div className="container-page grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-xl font-bold text-fg">Canales oficiales</h2>
          <p className="mt-2 mb-6 text-sm text-fg-muted">
            Respondemos por los canales indicados. {siteConfig.name} no almacena mensajes en este sitio.
          </p>
          <ContactChannels subject={`Consulta sobre ${siteConfig.name}`} whatsappText={`Hola, tengo una consulta sobre ${siteConfig.name}.`} />
        </div>
        <div className="space-y-4 text-sm text-fg-muted">
          <div className="rounded-[var(--radius-card)] border border-line bg-bg-subtle p-6">
            <h2 className="font-semibold text-fg">¿Un dato de un negocio es incorrecto?</h2>
            <p className="mt-2">
              Indicanos el nombre del negocio y qué dato corregir. Si sos el titular, también podés pedir que se actualice o se retire tu ficha.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-bg-subtle p-6">
            <h2 className="font-semibold text-fg">¿Querés sumar tu negocio?</h2>
            <p className="mt-2">
              Mirá{" "}
              <Link href="/sumar-negocio/" className="font-semibold text-accent-text underline">
                cómo funciona la incorporación
              </Link>
              .
            </p>
          </div>
          <p className="px-1 text-xs text-fg-subtle">
            Para consultas o reclamos sobre un comercio en particular, comunicate directamente con ese comercio.
          </p>
        </div>
      </div>
    </>
  );
}
