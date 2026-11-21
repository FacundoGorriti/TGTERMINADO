import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { getCategories, getCategory } from "@/lib/catalog/categories";
import { getBusinessesByCategory, getCities, getSubcategoryCounts, toSummary } from "@/lib/catalog";
import { getFilterCategories } from "@/lib/catalog/client-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { CategoryIcon } from "@/components/categories/category-icon";
import { DirectoryExplorer } from "@/components/search/directory-explorer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/primitives";
import { pluralize } from "@/lib/utils/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.id }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return buildMetadata({
    title: `${category.name} en ${siteConfig.location.mainCity}`,
    description: `${category.description} Directorio de ${category.name.toLowerCase()} en ${siteConfig.location.mainCity}, ${siteConfig.location.province}.`,
    path: `/categorias/${category.id}/`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const businesses = getBusinessesByCategory(category.id)
    .map(toSummary)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "es"));
  const subCounts = getSubcategoryCounts(category.id);
  const cities = getCities();

  return (
    <>
      <header className="border-b border-line bg-bg-subtle">
        <div className="container-page py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { name: "Categorías", path: "/categorias/" },
              { name: category.name, path: `/categorias/${category.id}/` },
            ]}
          />
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-fg shadow-card sm:size-16">
              <CategoryIcon name={category.icon} className="size-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-fg sm:text-4xl">{category.name}</h1>
              <p className="mt-2 max-w-2xl text-fg-muted">{category.description}</p>
              <p className="mt-2 text-sm font-semibold text-fg-subtle">{pluralize(businesses.length, "negocio publicado", "negocios publicados")}</p>
            </div>
          </div>

          <nav aria-label={`Subrubros de ${category.name}`} className="mt-6">
            <h2 className="sr-only">Subrubros</h2>
            <ul className="flex flex-wrap gap-2">
              {category.subcategories.map((s) => (
                <li key={s.id}>
                  <a
                    href={`/categorias/${category.id}/?sub=${s.id}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm text-fg-muted hover:border-accent hover:text-fg"
                  >
                    {s.name}
                    <span className="text-xs text-fg-subtle tabular-nums">{subCounts[s.id] ?? 0}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div className="container-page py-8 sm:py-10">
        {businesses.length === 0 ? (
          <EmptyState
            title={`Aún no hay negocios en ${category.name}`}
            description="Este rubro todavía no tiene negocios publicados. Si conocés uno o tenés el tuyo, podés sumarlo."
            action={{ href: "/sumar-negocio/", label: "Sumar un negocio" }}
          />
        ) : (
          <DirectoryExplorer
            businesses={businesses}
            categories={getFilterCategories()}
            cities={cities}
            lockedCategory={category.id}
            pageSize={siteConfig.features.pageSize}
            searchPlaceholder={`Buscar en ${category.name.toLowerCase()}`}
          />
        )}
      </div>
    </>
  );
}
