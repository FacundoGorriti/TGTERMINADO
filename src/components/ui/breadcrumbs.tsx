import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo/metadata";

/** Migas de pan accesibles + BreadcrumbList de Schema.org. */
export function Breadcrumbs({ items, structuredData = true }: { items: Crumb[]; structuredData?: boolean }) {
  const all: Crumb[] = [{ name: "Inicio", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Migas de pan" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-fg-subtle">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={item.path} className="flex min-w-0 items-center gap-1">
                {last ? (
                  <span aria-current="page" className="truncate font-medium text-fg-muted">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="rounded hover:text-fg hover:underline">
                      {item.name}
                    </Link>
                    <ChevronRight aria-hidden className="size-3.5 shrink-0" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {structuredData && <JsonLd data={breadcrumbJsonLd(all)} />}
    </>
  );
}
