"use client";

import { useEffect, useRef } from "react";

/**
 * Lienzo fijo detrás del contenido con la cadena 3D. three.js se descarga recién cuando el navegador
 * está libre (después del primer pintado), así no compite con la carga de la página.
 * Es decorativo: aria-hidden y sin eventos de puntero.
 */
export function ChainBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Navegadores automatizados (pruebas): la cadena es decorativa y solo sumaría carga.
    if (navigator.webdriver) return;
    let disposed = false;
    let cleanup: () => void = () => {};
    const load = () => {
      import("@/lib/three/chain")
        .then(({ mountChain }) => {
          if (!disposed && ref.current) cleanup = mountChain(ref.current);
        })
        .catch(() => {
          /* sin la cadena el sitio funciona igual */
        });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    // Después del evento load y con el navegador libre: no compite con la carga de la página.
    let id = 0;
    const schedule = () => {
      id = w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 2500 }) : window.setTimeout(load, 600);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener("load", schedule);
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
      cleanup();
    };
  }, []);

  return <div ref={ref} aria-hidden data-testid="chain-background" className="pointer-events-none fixed inset-0 z-0" />;
}
