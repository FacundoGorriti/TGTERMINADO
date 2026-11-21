import Link from "next/link";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
      <span className="grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent-text">
        <Compass aria-hidden className="size-8" />
      </span>
      <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-accent-text">ERROR 404</p>
      <h1 className="mt-2 text-3xl font-bold text-fg sm:text-4xl">No encontramos esta página</h1>
      <p className="mt-3 max-w-md text-fg-muted">
        Puede que el negocio ya no esté publicado o que la dirección tenga un error. Probá buscando en el directorio.
      </p>
      <div className="mt-8 w-full max-w-md">
        <SearchBar />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary", "md")}>
          Volver al inicio
        </Link>
        <Link href="/categorias/" className={buttonClasses("secondary", "md")}>
          Ver categorías
        </Link>
      </div>
    </div>
  );
}
