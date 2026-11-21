import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { buildMetadata } from "@/lib/seo/metadata";
import { Pending, Prose } from "@/components/layout/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Notice, PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Política de privacidad",
  description: `Cómo ${siteConfig.name} trata la información: sin cuentas, sin formularios y con favoritos guardados solo en tu navegador.`,
  path: "/privacidad/",
});

const LAST_UPDATE = "21 de noviembre de 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Política de privacidad" description={`Última actualización: ${LAST_UPDATE}`}>
        <Breadcrumbs items={[{ name: "Privacidad", path: "/privacidad/" }]} />
      </PageHeader>
      <div className="container-page py-10 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <Notice tone="warning" title="Documento con datos pendientes">
            Antes de la publicación definitiva deben completarse los campos marcados como pendientes y se recomienda la revisión de un
            profesional del derecho.
          </Notice>
        </div>
        <Prose>
          <h2>1. Responsable</h2>
          <p>
            El sitio {siteConfig.name} es operado por <Pending>nombre o razón social del responsable</Pending>, con domicilio en{" "}
            <Pending>domicilio legal</Pending> y CUIT <Pending>CUIT</Pending>. Contacto: <Link href="/contacto/">página de contacto</Link>.
          </p>

          <h2>2. Qué datos tratamos</h2>
          <h3>Datos de quienes visitan el sitio</h3>
          <ul>
            <li>
              <strong>No hay cuentas, registros ni formularios.</strong> El sitio no solicita nombre, correo, teléfono ni ningún otro dato
              personal de los visitantes.
            </li>
            <li>
              <strong>Búsquedas y filtros:</strong> se procesan íntegramente en tu navegador. Las consultas no se envían a ningún servidor
              de {siteConfig.name}. Pueden quedar reflejadas en la dirección (URL) de la página para que puedas compartir una búsqueda.
            </li>
            <li>
              <strong>Almacenamiento local:</strong> el navegador guarda tu preferencia de tema (claro/oscuro/automático) y la lista de
              negocios favoritos mediante <em>localStorage</em>. Esa información permanece en tu dispositivo, no se transmite y podés
              borrarla en cualquier momento desde la configuración del navegador o con el botón “Quitar todos” en Favoritos.
            </li>
            <li>
              <strong>Sin cookies propias, analítica ni publicidad.</strong> Esta versión del sitio no instala cookies de seguimiento ni
              herramientas de analítica o publicidad de terceros.
            </li>
            <li>
              <strong>Registros técnicos del proveedor de alojamiento:</strong> el sitio se aloja en Vercel Inc., que como cualquier
              servidor web puede registrar datos técnicos de las solicitudes (por ejemplo, dirección IP, fecha y navegador) para operar y
              proteger el servicio, según su propia política de privacidad.
            </li>
          </ul>

          <h3>Datos de los negocios publicados</h3>
          <p>
            Las fichas contienen únicamente información comercial de carácter público (nombre comercial, rubro, dirección del local,
            horarios, teléfono o WhatsApp comercial, redes y sitio web) aportada o autorizada por cada titular. No se publican datos
            personales sensibles.
          </p>

          <h2>3. Enlaces externos</h2>
          <p>
            Al tocar “Visitar sitio web”, WhatsApp, redes sociales o mapas, salís de {siteConfig.name}. Esos servicios tienen sus propias
            políticas de privacidad, por las que este sitio no responde.
          </p>

          <h2>4. Derechos</h2>
          <p>
            Conforme a la Ley 25.326 de Protección de los Datos Personales, los titulares pueden solicitar el acceso, la rectificación,
            la actualización o la supresión de sus datos a través de la <Link href="/contacto/">página de contacto</Link>. La Agencia de
            Acceso a la Información Pública, en su carácter de órgano de control de la Ley 25.326, tiene la atribución de atender las
            denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en
            materia de protección de datos personales.
          </p>
          <p>
            Registro de bases de datos ante la autoridad de control, si correspondiera: <Pending>a determinar por el responsable</Pending>.
          </p>

          <h2>5. Cambios</h2>
          <p>
            Si el funcionamiento del sitio cambia (por ejemplo, si se incorporan formularios o analítica), esta política se actualizará
            antes de implementar esos cambios y se indicará la nueva fecha de actualización.
          </p>
        </Prose>
      </div>
    </>
  );
}
