"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, House, LayoutGrid } from "lucide-react";
import { siteConfig, type NavIcon } from "@/data/site-config";
import { cn } from "@/lib/utils/cn";
import { useFavorites } from "@/hooks/use-favorites";

const ICONS: Record<NavIcon, typeof House> = { home: House, compass: Compass, grid: LayoutGrid, heart: Heart };

function isActive(pathname: string, href: string): boolean {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/") return normalized === "/";
  return normalized.startsWith(href);
}

export function DesktopNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1 shadow-card">
        {siteConfig.navigation.main.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                  active ? "bg-ink text-lime dark:bg-lime dark:text-ink" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { count } = useFavorites();
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <ul className="glass mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.75rem] border border-line p-1.5 shadow-raised">
        {siteConfig.navigation.main.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item.href);
          const showCount = item.icon === "heart" && count > 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[3.6rem] flex-col items-center justify-center gap-0.5 rounded-[1.35rem] text-[0.68rem] font-semibold transition-[background-color,color] duration-300",
                  active ? "bg-ink text-lime dark:bg-lime dark:text-ink" : "text-fg-muted hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "relative grid h-7 w-12 place-items-center transition-transform duration-300 ease-[var(--ease-spring)]",
                    active && "-translate-y-0.5 scale-110",
                  )}
                >
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.4 : 2} />
                  {showCount && (
                    <span className="absolute -top-1 right-1 grid min-w-4 place-items-center rounded-full bg-lime px-1 text-[0.6rem] leading-4 font-bold text-ink ring-2 ring-[var(--t-bg)]">
                      {count > 99 ? "99+" : count}
                      <span className="sr-only"> guardados</span>
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
