import { SLUG_PATTERN_SOURCE } from "@/lib/utils/patterns";

/**
 * Persistencia de favoritos en localStorage.
 * - Solo se guardan slugs públicos (sin datos personales).
 * - Todo lo leído se valida: datos corruptos o manipulados se descartan.
 * - Cantidad y tamaño limitados.
 */

export const FAVORITES_KEY = "tgo:favorites:v1";
export const MAX_FAVORITES_DEFAULT = 100;
const MAX_RAW_LENGTH = 20_000;
const SLUG = new RegExp(SLUG_PATTERN_SOURCE);

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Interpreta el contenido crudo de forma segura. Nunca lanza. */
export function parseFavorites(raw: string | null, max = MAX_FAVORITES_DEFAULT): string[] {
  if (!raw || raw.length > MAX_RAW_LENGTH) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { slugs?: unknown }).slugs)
      ? (data as { slugs: unknown[] }).slugs
      : [];
  const valid: string[] = [];
  for (const value of list) {
    if (typeof value === "string" && value.length <= 80 && SLUG.test(value) && !valid.includes(value)) {
      valid.push(value);
      if (valid.length >= max) break;
    }
  }
  return valid;
}

export function serializeFavorites(slugs: readonly string[]): string {
  return JSON.stringify({ v: 1, slugs });
}

export function readFavorites(storage: StorageLike | null, max = MAX_FAVORITES_DEFAULT): string[] {
  if (!storage) return [];
  try {
    return parseFavorites(storage.getItem(FAVORITES_KEY), max);
  } catch {
    return [];
  }
}

export type ToggleResult = { slugs: string[]; added: boolean; limitReached: boolean };

export function toggleFavorite(current: readonly string[], slug: string, max = MAX_FAVORITES_DEFAULT): ToggleResult {
  if (!SLUG.test(slug)) return { slugs: [...current], added: false, limitReached: false };
  if (current.includes(slug)) return { slugs: current.filter((s) => s !== slug), added: false, limitReached: false };
  if (current.length >= max) return { slugs: [...current], added: false, limitReached: true };
  return { slugs: [...current, slug], added: true, limitReached: false };
}

export function writeFavorites(storage: StorageLike | null, slugs: readonly string[]): boolean {
  if (!storage) return false;
  try {
    if (slugs.length === 0) storage.removeItem(FAVORITES_KEY);
    else storage.setItem(FAVORITES_KEY, serializeFavorites(slugs));
    return true;
  } catch {
    // Cuota excedida o almacenamiento bloqueado (modo privado): se informa al llamador.
    return false;
  }
}
