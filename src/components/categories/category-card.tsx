import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types/category";
import { CategoryIcon } from "@/components/categories/category-icon";
import { pluralize } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function CategoryCard({ category, count, variant = "full" }: { category: Category; count: number; variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <Link
        href={`/categorias/${category.id}/`}
        className="group flex min-h-24 flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/50 active:scale-[0.98]"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-text">
          <CategoryIcon name={category.icon} className="size-5" />
        </span>
        <span className="text-sm leading-tight font-semibold text-fg">{category.name}</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/categorias/${category.id}/`}
      className={cn(
        "group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card",
        "transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-raised active:scale-[0.99]",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-text">
          <CategoryIcon name={category.icon} className="size-6" />
        </span>
        <ArrowUpRight aria-hidden className="size-5 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-fg">{category.name}</h3>
      <p className="mt-1.5 flex-1 text-sm text-fg-muted">{category.description}</p>
      <p className="mt-4 text-xs font-semibold text-fg-subtle">
        {pluralize(count, "negocio", "negocios")} · {pluralize(category.subcategories.length, "subrubro", "subrubros")}
      </p>
    </Link>
  );
}
