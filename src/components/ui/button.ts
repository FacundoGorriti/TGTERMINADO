import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg shadow-card hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-fg hover:border-accent hover:text-accent-text",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  whatsapp: "bg-[#1a7f45] text-white shadow-card hover:bg-[#156b3a]",
  inverse: "bg-ivory text-ink hover:bg-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-12 px-6 text-base",
};

/** Clases de botón reutilizables para <button> y <a>. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
