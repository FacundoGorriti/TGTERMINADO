import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { Pending, Prose } from "@/components/layout/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Notice, PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Términos y condiciones",
  description: `Condiciones de uso del directorio ${siteConfig.name}.`,
  path: "/terminos/",
});

const LAST_UPDATE = "21 de noviembre de 2026";

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Términos y condiciones" description={`Última actualización: ${LAST_UPDATE}`}>
        <Breadcrumbs items={[{ name: "Términos", path: "/terminos/" }]} />
      </PageHeader>
      <div className="container-page py-10 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <Notice tone="warning" title="Documento con datos pendientes">
            Completar los campos marcados como pendientes antes de la publicación definitiva. Se recomienda revisión profesional.
          </Notice>
        </div>
        <Prose>
          <h2>1. Qué es el servicio</h2>
          <p>
            {siteConfig.name} es un directorio informativo y gratuito de comercios, profesionales, servicios y emprendimientos de{" "}
            {siteConfig.location.mainCity}, {siteConfig.location.province} y localidades cercanas. El sitio no vende productos ni
            servicios, no toma pedidos, turnos ni reservas y no procesa pagos.
          </p>

          <h2>2. Información de los negocios</h2>
          <ul>
            <li>La información de cada ficha es aportada o autorizada por el titular del negocio y se publica con carácter orientativo.</li>
            <li>
              Horarios, servicios, precios, disponibilidad y condiciones pueden cambiar sin aviso. Recomendamos confirmarlos directamente
              con el negocio.
            </li>
            <li>
              La relación comercial se establece exclusivamente entre el visitante y cada negocio. {siteConfig.name} no es parte de esa
              relación ni garantiza productos o servicios de terceros.
            </li>
          </ul>

          <h2>3. Sitios externos</h2>
          <p>
            Las tarjetas del directorio enlazan a la web propia de cada negocio, que a su vez puede enlazar a WhatsApp, redes o mapas. Esos contenidos son responsabilidad de
            sus titulares.
          </p>

          <h2>4. Correcciones y bajas</h2>
          <p>
            Los titulares pueden solicitar la corrección, actualización o retiro de su ficha mediante la{" "}
            <Link href="/contacto/">página de contacto</Link>. {siteConfig.name} puede no publicar o retirar fichas con información
            incorrecta, desactualizada o contraria a la ley.
          </p>

          <h2>5. Propiedad intelectual</h2>
          <p>
            La marca, el diseño y el código de {siteConfig.name} pertenecen a <Pending>titular</Pending>. Los nombres, logotipos e
            imágenes de cada negocio pertenecen a sus respectivos titulares y se usan con su autorización.
          </p>

          <h2>6. Disponibilidad</h2>
          <p>
            El sitio se ofrece “tal como está”. Se procura mantenerlo disponible y actualizado, sin garantizar la ausencia de
            interrupciones o errores.
          </p>

          <h2>7. Ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Jurisdicción: <Pending>tribunales competentes a definir</Pending>.
          </p>
        </Prose>
      </div>
    </>
  );
}
