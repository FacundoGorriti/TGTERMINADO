"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/**
 * Panel inferior de filtros para móvil, basado en <dialog> nativo:
 * foco atrapado, cierre con Escape y fondo inerte sin dependencias.
 */
export function FilterDrawer({
  open,
  onClose,
  onReset,
  resultCount,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="filtros-titulo"
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-3xl border-t border-line bg-surface p-0 text-fg shadow-raised backdrop:bg-black/50 open:animate-sheet-up md:hidden"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="filtros-titulo" className="text-lg font-semibold">
            Filtros
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar filtros" className="tap-target grid place-items-center rounded-full hover:bg-surface-2">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">{children}</div>
        <div className="pb-safe flex gap-2 border-t border-line px-4 pt-3">
          <button type="button" onClick={onReset} className={buttonClasses("ghost", "lg", "mb-3")}>
            Limpiar
          </button>
          <button type="button" onClick={onClose} className={buttonClasses("primary", "lg", "mb-3 flex-1")}>
            Ver {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
