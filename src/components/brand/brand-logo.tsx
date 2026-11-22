import { cn } from "@/lib/utils/cn";

/**
 * Isotipo TARTAGAL GO: dos eslabones entrelazados en verde lima sobre negro tinta.
 * "Tu ciudad, conectada": cada negocio es un eslabón. Funciona en monocromo y a 16 px.
 */
export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="9" fill="#07080B" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#C8F031" strokeOpacity="0.28" />
      <g fill="none" stroke="#C8F031" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 4)">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </g>
    </svg>
  );
}

/** Logotipo: isotipo + "TARTAGAL" + "GO" en píldora lima (la señal de avance). */
export function BrandLogo({ className, compact = false, tone = "auto" }: { className?: string; compact?: boolean; tone?: "auto" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="size-9" />
      <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", compact && "max-[359px]:sr-only")}>
        <span className={cn("font-display text-[0.98rem] leading-none font-bold tracking-[0.06em]", tone === "light" ? "text-ivory" : "text-fg")}>TARTAGAL</span>{" "}
        <span className="rounded-full bg-lime px-2 py-1 font-display text-[0.78rem] leading-none font-extrabold tracking-[0.04em] text-ink">GO</span>
      </span>
    </span>
  );
}
