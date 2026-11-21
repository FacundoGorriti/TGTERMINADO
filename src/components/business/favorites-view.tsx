"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Heart, Trash2 } from "lucide-react";
import type { BusinessSummary } from "@/types/business";
import { useFavorites } from "@/hooks/use-favorites";
import { BusinessGrid } from "@/components/business/business-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

const noopSubscribe = () => () => {};

export function FavoritesView({ businesses }: { businesses: BusinessSummary[] }) {
  const { favorites, clearFavorites, pruneFavorites, max } = useFavorites();
  // Evita mostrar el estado vacío antes de leer localStorage (hidratación).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const bySlug = useMemo(() => new Map(businesses.map((b) => [b.slug, b])), [businesses]);
  const saved = favorites.map((slug) => bySlug.get(slug)).filter((b): b is BusinessSummary => Boolean(b));

  // Limpia favoritos de negocios que ya no están publicados.
  useEffect(() => {
    if (hydrated) pruneFavorites(new Set(bySlug.keys()));
  }, [hydrated, bySlug, pruneFavorites]);

  if (!hydrated) {
    return <p className="text-sm text-fg-muted">Cargando tus favoritos guardados en este dispositivo…</p>;
  }

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={<Heart aria-hidden className="size-7" />}
        title="Todavía no guardaste negocios"
        description="Tocá el corazón en cualquier negocio para guardarlo acá. Tus favoritos quedan solo en este navegador: no necesitás cuenta."
        action={{ href: "/explorar/", label: "Explorar negocios" }}
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-fg-muted" data-testid="favorites-count">
          {saved.length} {saved.length === 1 ? "negocio guardado" : "negocios guardados"} (máximo {max})
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Quitar todos los favoritos de este navegador?")) clearFavorites();
          }}
          className={buttonClasses("ghost", "sm")}
        >
          <Trash2 aria-hidden className="size-4" />
          Quitar todos
        </button>
      </div>
      <BusinessGrid businesses={saved} />
    </div>
  );
}
