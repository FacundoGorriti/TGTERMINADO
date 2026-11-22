import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types/category";
import { CategoryIcon } from "@/components/categories/category-icon";
import { pluralize } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const tile =
  "group relative flex h-full flex-col overflow-hidden border border-line bg-surface shadow-card transition-[border-color,transform,box-shadow] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-accent hover:shadow-raised active:scale-[0.98]";

export function CategoryCard({ category, count, variant = "full" }: { category: Category; count: number; variant?: "full" | "compact" | "feature" }) {
  const href = `/categorias/${category.id}/`;

  // Baldosa grande del bento (rubro más poblado): siempre oscura, con la cantidad en grande.
  if (variant === "feature") {
    return (
      <Link href={href} data-theme="dark" className={cn(tile, "min-h-56 rounded-[1.75rem] p-6 text-fg sm:min-h-full sm:p-8")}>
        <span aria-hidden className="absolute inset-0 -z-0 bg-ink" />
        <span aria-hidden className="grid-lines absolute inset-0 opacity-60" />
        <span aria-hidden className="absolute -right-16 -bottom-20 size-72 rounded-full bg-lime/25 blur-[80px] transition-transform duration-500 group-hover:scale-125" />
        <span className="relative flex items-start justify-between">
          <span className="grid size-14 place-items-center rounded-2xl bg-lime text-ink">
            <CategoryIcon name={category.icon} className="size-7" />
          </span>
          <ArrowUpRight aria-hidden className="size-6 text-fg-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-lime" />
        </span>
        <span className="relative mt-auto block pt-10">
          <span className="block font-display text-[clamp(3.5rem,14vw,6rem)] leading-none font-extrabold text-lime">{count}</span>
          <span className="mt-2 block font-display text-2xl font-bold sm:text-3xl">{category.name}</span>
          <span className="mt-2 block max-w-sm text-sm text-fg-muted">{category.description}</span>
        </span>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className={cn(tile, "min-h-36 justify-between gap-4 rounded-[1.4rem] p-4 sm:p-5")}>
        <span className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-ink text-lime transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 dark:bg-lime dark:text-ink">
            <CategoryIcon name={category.icon} className="size-5" />
          </span>
          {count > 0 ? (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-fg">{count}</span>
          ) : (
            <span className="text-xs font-semibold text-fg-subtle">Pronto</span>
          )}
        </span>
        <span className="text-[0.95rem] leading-tight font-semibold text-fg">{category.name}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn(tile, "rounded-[var(--radius-card)] p-6")}>
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-ink text-lime transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 dark:bg-lime dark:text-ink">
          <CategoryIcon name={category.icon} className="size-6" />
        </span>
        <ArrowUpRight aria-hidden className="size-5 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-fg">{category.name}</h3>
      <p className="mt-1.5 flex-1 text-sm text-fg-muted">{category.description}</p>
      <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-fg-subtle">
        <span className={cn("rounded-full px-2.5 py-1", count > 0 ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-muted")}>{pluralize(count, "negocio", "negocios")}</span>
        {pluralize(category.subcategories.length, "subrubro", "subrubros")}
      </p>
    </Link>
  );
}
