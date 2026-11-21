import Link from "next/link";
import { Compass, HeartHandshake, Lightbulb, MapPinned } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Qué es TARTAGAL GO",
  description: `${siteConfig.name} es el directorio digital de ${siteConfig.location.mainCity}: misión, propuesta de valor y funcionamiento.`,
  path: "/nosotros/",
});

const PILLARS = [
  { icon: Compass, title: "Misión", text: `Que cualquier persona encuentre en segundos lo que necesita en ${siteConfig.location.mainCity}, y que cada negocio local tenga una presencia digital clara y profesional.` },
  { icon: Lightbulb, title: "Propuesta de valor", text: "Un portal rápido, sin registros ni publicidad invasiva, con información comercial verificada y conectada a los sitios propios de cada negocio." },
  { icon: MapPinned, title: "Enfoque local", text: `Nacimos para ${siteConfig.location.mainCity} y el norte de ${siteConfig.location.province}. Priorizamos la realidad de la ciudad: conectividad móvil, WhatsApp y comercios de cercanía.` },
  { icon: HeartHandshake, title: "Digitalización", text: "Acompañamos a comercios, profesionales y emprendimientos a dar sus primeros pasos digitales, empezando por estar fáciles de encontrar." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Nosotros" title={`Qué es ${siteConfig.name}`} description="El punto de conexión digital entre las personas y los negocios de su ciudad.">
        <Breadcrumbs items={[{ name: "Nosotros", path: "/nosotros/" }]} />
      </PageHeader>
      <div className="container-page space-y-14 py-10 sm:py-14">
        <ul className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card">
              <Icon aria-hidden className="size-7 text-accent-text" />
              <h2 className="mt-4 text-xl font-semibold text-fg">{title}</h2>
              <p className="mt-2 text-fg-muted">{text}</p>
            </li>
          ))}
        </ul>

        <section aria-labelledby="funcionamiento" className="max-w-3xl">
          <h2 id="funcionamiento" className="text-2xl font-bold text-fg sm:text-3xl">
            Cómo funciona
          </h2>
          <div className="mt-4 space-y-4 text-fg-muted">
            <p>
              {siteConfig.name} es un <strong className="text-fg">portal de descubrimiento</strong>: reúne fichas públicas de negocios y las
              conecta con sus canales propios (sitio web, WhatsApp, teléfono, redes y ubicación). No vende productos, no toma pedidos ni
              reservas y no intermedia pagos: cada negocio atiende a sus clientes por sus propios medios.
            </p>
            <p>
              La información se carga y revisa manualmente antes de publicarse. Las búsquedas y los favoritos funcionan en tu navegador,
              sin crear cuentas y sin enviar tus consultas a ningún servidor.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explorar/" className={buttonClasses("primary", "lg")}>
              Explorar el directorio
            </Link>
            <Link href="/sumar-negocio/" className={buttonClasses("secondary", "lg")}>
              Sumar mi negocio
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
