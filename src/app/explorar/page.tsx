import { siteConfig } from "@/data/site-config";
import { getCities, getVisibleSummaries } from "@/lib/catalog";
import { getFilterCategories } from "@/lib/catalog/client-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { DirectoryExplorer } from "@/components/search/directory-explorer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState, PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Explorar el directorio",
  description: `Buscá y filtrá comercios, profesionales y servicios de ${siteConfig.location.mainCity}, ${siteConfig.location.province}, por rubro, localidad y sitio web.`,
  path: "/explorar/",
});

export default function ExplorePage() {
  const businesses = [...getVisibleSummaries()].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "es"),
  );
  const categories = getFilterCategories();
  const cities = getCities();

  return (
    <>
      <PageHeader
        eyebrow="Directorio"
        title="Explorar"
        description={`Todos los negocios de ${siteConfig.location.mainCity} y la región en un solo lugar. Buscá por nombre, rubro o servicio.`}
      >
        <Breadcrumbs items={[{ name: "Explorar", path: "/explorar/" }]} />
      </PageHeader>
      <div className="container-page py-8 sm:py-10">
        {businesses.length === 0 ? (
          <EmptyState
            title="Todavía no hay negocios publicados"
            description="El directorio se está armando. Volvé pronto o sumá tu negocio."
            action={{ href: "/sumar-negocio/", label: "Sumar mi negocio" }}
          />
        ) : (
          <DirectoryExplorer
            businesses={businesses}
            categories={categories}
            cities={cities}
            pageSize={siteConfig.features.pageSize}
          />
        )}
      </div>
    </>
  );
}
