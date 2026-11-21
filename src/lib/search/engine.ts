import type { BusinessSummary } from "@/types/business";

/**
 * MOTOR DE BÚSQUEDA LOCAL
 * ---------------------------------------------------------------------------
 * Búsqueda 100% en el navegador, sin enviar consultas a ningún servidor.
 * - Ignora mayúsculas y acentos ("cafe" encuentra "Café").
 * - Coincidencias parciales por prefijo y por subcadena.
 * - Todas las palabras de la consulta deben coincidir en algún campo (AND).
 * - Prioriza coincidencias en el nombre comercial.
 *
 * La interfaz `SearchEngine` permite reemplazar esta implementación (por ejemplo,
 * por un índice precalculado o un servicio externo) sin tocar los componentes.
 */

export interface SearchHit<T> {
  item: T;
  score: number;
}

export interface SearchEngine<T> {
  search(query: string): SearchHit<T>[];
}

const MAX_QUERY_LENGTH = 100;
const MAX_TOKENS = 8;

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  const normalized = normalizeText(query.slice(0, MAX_QUERY_LENGTH));
  if (!normalized) return [];
  return [...new Set(normalized.split(" ").filter(Boolean))].slice(0, MAX_TOKENS);
}

interface IndexedField {
  text: string;
  words: string[];
  weight: number;
}

interface IndexedDoc<T> {
  item: T;
  fields: IndexedField[];
  nameKey: string;
}

function field(text: string, weight: number): IndexedField {
  const normalized = normalizeText(text);
  return { text: normalized, words: normalized.split(" ").filter(Boolean), weight };
}

/** Puntaje de un token en un campo: palabra exacta > prefijo de palabra > subcadena. */
function scoreToken(token: string, f: IndexedField): number {
  if (!f.text) return 0;
  if (f.words.includes(token)) return f.weight * 1.5;
  if (f.words.some((w) => w.startsWith(token))) return f.weight * 1.2;
  if (token.length >= 3 && f.text.includes(token)) return f.weight * 0.6;
  return 0;
}

export interface FieldExtractor<T> {
  name: (item: T) => string;
  fields: (item: T) => Array<{ text: string; weight: number }>;
}

export function createLocalSearchEngine<T>(items: readonly T[], extractor: FieldExtractor<T>): SearchEngine<T> {
  const index: IndexedDoc<T>[] = items.map((item) => ({
    item,
    nameKey: normalizeText(extractor.name(item)),
    fields: [field(extractor.name(item), 100), ...extractor.fields(item).map((f) => field(f.text, f.weight))],
  }));

  return {
    search(query: string): SearchHit<T>[] {
      const tokens = tokenize(query);
      if (tokens.length === 0) return index.map((d) => ({ item: d.item, score: 0 }));

      const hits: SearchHit<T>[] = [];
      for (const doc of index) {
        let total = 0;
        let allMatched = true;
        for (const token of tokens) {
          let best = 0;
          for (const f of doc.fields) best = Math.max(best, scoreToken(token, f));
          if (best === 0) {
            allMatched = false;
            break;
          }
          total += best;
        }
        if (!allMatched) continue;
        // Bonificación si el nombre comienza con la consulta completa.
        const phrase = tokens.join(" ");
        if (doc.nameKey.startsWith(phrase)) total += 80;
        else if (doc.nameKey.includes(phrase)) total += 30;
        hits.push({ item: doc.item, score: total });
      }
      return hits.sort((a, b) => b.score - a.score);
    },
  };
}

/** Motor configurado para el catálogo de negocios. */
export function createBusinessSearch(items: readonly BusinessSummary[]): SearchEngine<BusinessSummary> {
  return createLocalSearchEngine(items, {
    name: (b) => b.name,
    fields: (b) => [
      { text: b.subcategoryName, weight: 45 },
      { text: b.categoryName, weight: 35 },
      { text: b.searchText.keywords.join(" "), weight: 30 },
      { text: b.searchText.features.join(" "), weight: 25 },
      { text: b.city, weight: 20 },
      { text: b.shortDescription, weight: 15 },
      { text: b.searchText.description, weight: 10 },
    ],
  });
}
