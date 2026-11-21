import Link from "next/link";
import { Search } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DesktopNavigation } from "@/components/navigation/navigation";
import { ThemeToggleButton } from "@/components/layout/theme-switcher";
import { buttonClasses } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center justify-between gap-3 md:h-16">
        <Link href="/" aria-label="TARTAGAL GO — Inicio" className="-ml-1 rounded-xl p-1">
          <BrandLogo compact />
        </Link>

        <DesktopNavigation />

        <div className="flex items-center gap-1">
          <Link
            href="/explorar/"
            className="tap-target inline-grid place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg md:hidden"
            aria-label="Buscar negocios"
          >
            <Search aria-hidden className="size-5" />
          </Link>
          <ThemeToggleButton />
          <div className="ml-1 hidden lg:block">
            <Link href="/sumar-negocio/" className={buttonClasses("primary", "sm")}>
              Sumar mi negocio
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
