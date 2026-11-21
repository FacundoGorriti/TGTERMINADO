import { siteConfig } from "@/data/site-config";
import { getCategories } from "@/lib/catalog/categories";
import { getCategoryCounts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { CategoryCard } from "@/components/categories/category-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/primitives";

export const metadata = buildMetadata({
  title: "Categorías y rubros",
  description: `Todos los rubros del directorio de ${siteConfig.location.mainCity}: salud, gastronomía, comercios, construcción, turismo, automotores, profesionales y más.`,
  path: "/categorias/",
});

export default function CategoriesPage() {
  const categories = getCategories();
  const counts = getCategoryCounts();
  return (
    <>
      <PageHeader
        eyebrow="Rubros"
        title="Categorías"
        description="Recorré el directorio por rubro. La cantidad de negocios se calcula a partir del catálogo publicado."
      >
        <Breadcrumbs items={[{ name: "Categorías", path: "/categorias/" }]} />
      </PageHeader>
      <div className="container-page py-8 sm:py-12">
        <h2 className="sr-only">Todos los rubros</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <CategoryCard category={c} count={counts[c.id] ?? 0} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
