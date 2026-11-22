import Link from "next/link";
import { Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DesktopNavigation } from "@/components/navigation/navigation";
import { ThemeToggleButton } from "@/components/layout/theme-switcher";
import { buttonClasses } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="pt-safe glass sticky top-0 z-40 border-b border-line/70">
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
        <Link href="/" aria-label="TARTAGAL GO — Inicio" className="-ml-1 rounded-xl p-1">
          <BrandLogo compact />
        </Link>

        <DesktopNavigation />

        <div className="flex items-center gap-1">
          <Link
            href="/explorar/"
            className="tap-target inline-grid place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-fg md:hidden"
            aria-label="Buscar negocios"
          >
            <Search aria-hidden className="size-5" />
          </Link>
          <ThemeToggleButton />
          <div className="ml-1 hidden lg:block">
            <Link href="/sumar-negocio/" className={buttonClasses("primary", "md")}>
              Sumar mi negocio
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
