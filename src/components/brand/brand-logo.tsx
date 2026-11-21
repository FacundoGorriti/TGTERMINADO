import { cn } from "@/lib/utils/cn";

/**
 * Isotipo TARTAGAL GO: un marcador de ubicación que contiene una flecha de avance.
 * "Encontrar" + "ir" en un solo gesto. Funciona en monocromo y a 16 px.
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
      <defs>
        <linearGradient id="tgo-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#315D91" />
          <stop offset="1" stopColor="#101D35" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#tgo-mark-bg)" />
      <path
        d="M16 5.75a7.25 7.25 0 0 0-7.25 7.25c0 5.35 7.25 13.25 7.25 13.25s7.25-7.9 7.25-13.25A7.25 7.25 0 0 0 16 5.75Z"
        fill="none"
        stroke="#F5F2EA"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="m14.4 10.1 3 2.9-3 2.9"
        fill="none"
        stroke="#F5F2EA"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="size-8" />
      <span
        className={cn(
          "font-display text-[1.05rem] leading-none font-bold tracking-[0.08em] whitespace-nowrap text-fg",
          compact && "max-[359px]:sr-only",
        )}
      >
        TARTAGAL<span className="text-accent-text"> GO</span>
      </span>
    </span>
  );
}
