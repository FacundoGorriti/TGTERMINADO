"use client";

import { cn } from "@/lib/utils/cn";

export interface FilterCategory {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

interface ChipOption {
  id: string | null;
  label: string;
  count?: number;
}

/** Grupo de opciones tipo "chip" de selección única (botones con aria-pressed). */
export function ChipGroup({
  label,
  options,
  value,
  onChange,
  scroll = false,
}: {
  label: string;
  options: ChipOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  scroll?: boolean;
}) {
  return (
    <div role="group" aria-label={label}>
      <ul className={cn("flex gap-2", scroll ? "no-scrollbar -mx-4 overflow-x-auto px-4 pb-1" : "flex-wrap")}>
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <li key={opt.id ?? "all"} className="shrink-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active && opt.id !== null ? null : opt.id)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors active:scale-[0.97]",
                  active ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {opt.label}
                {opt.count !== undefined && (
                  <span className={cn("text-xs tabular-nums", active ? "text-accent-fg/80" : "text-fg-subtle")}>{opt.count}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CategoryFilters({
  categories,
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  showCategories = true,
  subcategoryCounts,
}: {
  categories: FilterCategory[];
  category: string | null;
  subcategory: string | null;
  onCategoryChange: (id: string | null) => void;
  onSubcategoryChange: (id: string | null) => void;
  showCategories?: boolean;
  subcategoryCounts?: Record<string, number>;
}) {
  const selected = categories.find((c) => c.id === category);
  return (
    <div className="space-y-5">
      {showCategories && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-fg">Rubro</legend>
          <ChipGroup
            label="Rubro"
            value={category}
            onChange={(id) => {
              onCategoryChange(id);
              onSubcategoryChange(null);
            }}
            options={[{ id: null, label: "Todos" }, ...categories.map((c) => ({ id: c.id, label: c.name }))]}
          />
        </fieldset>
      )}
      {selected && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-fg">Subrubro</legend>
          <ChipGroup
            label="Subrubro"
            value={subcategory}
            onChange={onSubcategoryChange}
            options={[
              { id: null, label: "Todos" },
              ...selected.subcategories.map((s) => ({ id: s.id, label: s.name, count: subcategoryCounts?.[s.id] })),
            ]}
          />
        </fieldset>
      )}
    </div>
  );
}
