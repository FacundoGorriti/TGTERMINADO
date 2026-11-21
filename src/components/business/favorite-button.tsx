"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils/cn";

/** Guarda o quita un negocio de favoritos (localStorage). Estado anunciado a lectores de pantalla. */
export function FavoriteButton({
  slug,
  name,
  variant = "icon",
  className,
}: {
  slug: string;
  name: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { isFavorite, toggleFavorite, max } = useFavorites();
  const [message, setMessage] = useState("");
  const active = isFavorite(slug);

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const result = toggleFavorite(slug);
    if (result.limitReached) setMessage(`Alcanzaste el máximo de ${max} favoritos.`);
    else if (!result.persisted) setMessage("Guardado solo en esta sesión: el navegador bloquea el almacenamiento.");
    else setMessage(result.added ? `${name} agregado a favoritos` : `${name} quitado de favoritos`);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={variant === "icon" ? (active ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`) : undefined}
        data-testid="favorite-button"
        className={cn(
          variant === "icon"
            ? "tap-target grid place-items-center rounded-full border border-line bg-surface/90 backdrop-blur transition-[transform,background-color,color] hover:scale-105 active:scale-90"
            : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-[0.95rem] font-semibold transition-colors active:scale-[0.97]",
          variant === "full" && (active ? "border-accent bg-accent-soft text-accent-text" : "border-line-strong bg-surface text-fg hover:border-accent"),
          variant === "icon" && (active ? "text-danger" : "text-fg-muted hover:text-fg"),
          className,
        )}
      >
        <Heart aria-hidden className={cn("size-5 transition-transform", active && "scale-110 fill-current")} />
        {variant === "full" && (active ? "Guardado" : "Guardar")}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {message}
      </span>
    </>
  );
}
