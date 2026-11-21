import Link from "next/link";
import { BadgeCheck, FileText, Globe, Rocket, ShieldCheck, Smartphone } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { ContactChannels } from "@/components/layout/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader, SectionHeading } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Sumar mi negocio",
  description: `Cómo incorporar tu comercio, servicio o emprendimiento al directorio digital de ${siteConfig.location.mainCity}.`,
  path: "/sumar-negocio/",
});

const STEPS = [
  { icon: FileText, title: "Nos contactás", text: "Nos escribís por el canal oficial con el nombre del negocio, el rubro y cómo te encuentran tus clientes." },
  { icon: BadgeCheck, title: "Revisamos tu propuesta", text: "Vemos qué necesita tu negocio: carta, catálogo, turnos o pedidos por WhatsApp." },
  { icon: Globe, title: "Creamos tu web", text: "Diseñamos una web propia para tu negocio, con tu nombre, tu logo y tu dominio, lista para trabajar." },
  { icon: Rocket, title: "Publicamos", text: "Tu web queda en línea y tu negocio aparece en TARTAGAL GO: su tarjeta abre tu web directamente." },
];

const BENEFITS = [
  { icon: Smartphone, title: "Pensada para el celular", text: "La mayoría de las personas busca desde el teléfono. Tu web está hecha primero para el celular." },
  { icon: Globe, title: "Una herramienta de trabajo", text: "Por ejemplo, una carta con carrito que arma el pedido y lo envía a tu WhatsApp." },
  { icon: ShieldCheck, title: "Información verificada", text: "Solo publicamos datos comerciales públicos. Nada de reseñas ni números inventados." },
];

export default function AddBusinessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Para negocios"
        title="Sumá tu negocio a TARTAGAL GO"
        description="Hacé que te encuentren quienes buscan lo que ofrecés en la ciudad. Te explicamos cómo es el proceso."
      >
        <Breadcrumbs items={[{ name: "Sumar mi negocio", path: "/sumar-negocio/" }]} />
      </PageHeader>

      <div className="container-page space-y-16 py-10 sm:py-14">
        <section aria-labelledby="pasos">
          <SectionHeading id="pasos" title="¿Cómo es la incorporación?" description="Un proceso simple y acompañado, sin registros ni contraseñas." />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-fg">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="text-xs font-bold tracking-widest text-fg-subtle">PASO {i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold text-fg">{title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="beneficios">
          <SectionHeading id="beneficios" title="Qué incluye tu web" />
          <ul className="grid gap-4 md:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-bg-subtle p-5">
                <Icon aria-hidden className="size-6 shrink-0 text-accent-text" />
                <div>
                  <h3 className="font-semibold text-fg">{title}</h3>
                  <p className="mt-1 text-sm text-fg-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="datos" className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 id="datos" className="text-2xl font-bold text-fg sm:text-3xl">
              ¿Qué información necesitamos?
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-fg-muted">
              <li>Nombre comercial, rubro y una descripción breve.</li>
              <li>Dirección pública y localidad (si atendés al público).</li>
              <li>Horarios de atención.</li>
              <li>Teléfono comercial y/o WhatsApp comercial.</li>
              <li>Redes sociales y sitio web, si los tenés.</li>
              <li>Logotipo y fotos propias o con permiso de uso.</li>
            </ul>
            <p className="mt-4 text-sm text-fg-subtle">
              Solo se publican datos comerciales que el titular autoriza a difundir. Ver{" "}
              <Link href="/terminos/" className="font-semibold text-accent-text underline">
                Términos
              </Link>{" "}
              y{" "}
              <Link href="/privacidad/" className="font-semibold text-accent-text underline">
                Privacidad
              </Link>
              .
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-bold text-fg">Solicitar la incorporación</h2>
            <p className="mt-2 mb-6 text-sm text-fg-muted">
              Escribinos por el canal oficial. No usamos formularios: la conversación es directa con el equipo de {siteConfig.name}.
            </p>
            <ContactChannels
              subject={`Quiero sumar mi negocio a ${siteConfig.name}`}
              whatsappText={`Hola, quiero sumar mi negocio a ${siteConfig.name}.`}
            />
          </div>
        </section>
      </div>
    </>
  );
}
