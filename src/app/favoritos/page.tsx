import { getVisibleSummaries } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { FavoritesView } from "@/components/business/favorites-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Notice, PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Mis favoritos",
  description: "Los negocios que guardaste en este navegador.",
  path: "/favoritos/",
  noIndex: true,
});

export default function FavoritesPage() {
  return (
    <>
      <PageHeader eyebrow="Tu selección" title="Favoritos" description="Los negocios que guardaste para volver a encontrarlos rápido.">
        <Breadcrumbs items={[{ name: "Favoritos", path: "/favoritos/" }]} structuredData={false} />
      </PageHeader>
      <div className="container-page space-y-8 py-8 sm:py-10">
        <FavoritesView businesses={getVisibleSummaries()} />
        <Notice title="Se guardan solo en este dispositivo">
          Los favoritos se almacenan en el navegador (localStorage). No se envían a ningún servidor, no se sincronizan entre
          dispositivos y se pierden si borrás los datos del sitio.
        </Notice>
      </div>
    </>
  );
}
