"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { buttonClasses } from "@/components/ui/button";

/** Botón "volver arriba": aparece tras desplazarse; respeta reduced-motion. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("contenido")?.focus({ preventScroll: true });
  };
  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "tap-target fixed right-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-30 grid place-items-center rounded-full border border-line bg-surface text-fg shadow-raised transition-[opacity,transform] duration-300 md:right-6 md:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
    </button>
  );
}

/**
 * Compartir: usa la Web Share API nativa si existe; si no, copia el enlace.
 * El resultado se anuncia con una región aria-live.
 */
export function ShareButton({ title, text, url, className }: { title: string; text?: string; url: string; className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const share = async () => {
    const shareUrl = new URL(url, window.location.origin).toString();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button type="button" onClick={share} className={buttonClasses("secondary", "md", className)}>
        {status === "copied" ? <Check aria-hidden className="size-4" /> : <Share2 aria-hidden className="size-4" />}
        {status === "copied" ? "Enlace copiado" : "Compartir"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "Enlace copiado al portapapeles" : status === "error" ? "No se pudo copiar el enlace" : ""}
      </span>
    </>
  );
}
