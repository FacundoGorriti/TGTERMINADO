"use client";

import { useCallback, useSyncExternalStore } from "react";
import { siteConfig } from "@/data/site-config";
import {
  FAVORITES_KEY,
  readFavorites,
  toggleFavorite as toggle,
  writeFavorites,
  type StorageLike,
} from "@/lib/favorites/storage";

/**
 * Favoritos guardados en el navegador (localStorage). Sin cuentas ni sincronización.
 * Se comparte entre componentes y pestañas mediante un store externo.
 */

const MAX = siteConfig.features.maxFavorites;
const EMPTY: readonly string[] = Object.freeze([]);
const listeners = new Set<() => void>();
let snapshot: readonly string[] | null = null;

function storage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSnapshot(): readonly string[] {
  if (snapshot === null) snapshot = Object.freeze(readFavorites(storage(), MAX));
  return snapshot;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_KEY || event.key === null) {
      snapshot = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: string[]): boolean {
  const ok = writeFavorites(storage(), next);
  snapshot = Object.freeze(next);
  emit();
  return ok;
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const toggleFavorite = useCallback((slug: string) => {
    const result = toggle(getSnapshot(), slug, MAX);
    if (result.limitReached) return { ...result, persisted: false };
    const persisted = commit(result.slugs);
    return { ...result, persisted };
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    commit(getSnapshot().filter((s) => s !== slug));
  }, []);

  const clearFavorites = useCallback(() => {
    commit([]);
  }, []);

  /** Elimina slugs que ya no existen en el catálogo publicado. */
  const pruneFavorites = useCallback((validSlugs: ReadonlySet<string>) => {
    const current = getSnapshot();
    const next = current.filter((s) => validSlugs.has(s));
    if (next.length !== current.length) commit(next);
  }, []);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  return { favorites, count: favorites.length, isFavorite, toggleFavorite, removeFavorite, clearFavorites, pruneFavorites, max: MAX };
}
