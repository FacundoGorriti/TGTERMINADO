import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, Info, SearchX, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { buttonClasses } from "@/components/ui/button";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  id?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3 text-fg-muted">{eyebrow}</p>}
        <Tag id={id} className={cn("font-extrabold text-fg", Tag === "h1" ? "text-3xl sm:text-5xl" : "text-[1.75rem] leading-[1.05] sm:text-5xl")}>
          {title}
        </Tag>
        {description && <p className="mt-2 text-base text-fg-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-fg transition-colors hover:border-fg sm:self-auto"
        >
          {action.label}
          <span className="grid size-6 place-items-center rounded-full bg-accent text-accent-fg transition-transform group-hover:translate-x-0.5">
            <ArrowRight aria-hidden className="size-3.5" />
          </span>
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-12 text-center"
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent-text">
        {icon ?? <SearchX aria-hidden className="size-7" />}
      </div>
      <p className="font-display text-lg font-semibold text-fg">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-fg-muted">{description}</p>}
      {children}
      {action && (
        <Link href={action.href} className={buttonClasses("secondary", "md", "mt-6")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="rounded-[var(--radius-card)] border border-danger/30 bg-danger-soft px-6 py-10 text-center">
      <CircleAlert aria-hidden className="mx-auto mb-3 size-8 text-danger" />
      <p className="font-display text-lg font-semibold text-fg">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

type NoticeTone = "info" | "warning";

/** Aviso informativo. El ícono y el texto (no solo el color) comunican el tipo. */
export function Notice({ tone = "info", title, children }: { tone?: NoticeTone; title: string; children?: ReactNode }) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm",
        tone === "warning" ? "border-warning/30 bg-warning-soft" : "border-info/25 bg-info-soft",
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", tone === "warning" ? "text-warning" : "text-info")} />
      <div className="min-w-0">
        <p className="font-semibold text-fg">{title}</p>
        {children && <div className="mt-1 text-fg-muted">{children}</div>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "warning"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-surface-2 text-fg-muted",
        tone === "accent" && "bg-accent-soft text-accent-text",
        tone === "warning" && "bg-warning-soft text-warning ring-1 ring-warning/30",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="warning" className={className}>
      <TriangleAlert aria-hidden className="size-3.5" />
      Ejemplo ficticio
    </Badge>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <header data-band data-theme="dark" data-chain-light="white" className="relative overflow-hidden bg-ink text-fg">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(90%_100%_at_20%_0%,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-lime/12 blur-[100px]" />
      <div className="container-page py-10 sm:py-16">
        {children}
        {eyebrow && <p className="eyebrow mb-4 text-fg-muted">{eyebrow}</p>}
        <h1 className="text-[clamp(2.1rem,8vw,4.2rem)] leading-[1] font-extrabold text-fg">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">{description}</p>}
      </div>
    </header>
  );
}
