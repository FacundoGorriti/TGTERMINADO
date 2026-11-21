import { describe, expect, it } from "vitest";
import {
  FAVORITES_KEY,
  parseFavorites,
  readFavorites,
  serializeFavorites,
  toggleFavorite,
  writeFavorites,
  type StorageLike,
} from "@/lib/favorites/storage";
import { groupOpeningHours, formatDate } from "@/lib/utils/format";
import { serializeJsonLd } from "@/components/seo/json-ld";
// @ts-expect-error — módulo JS sin tipos (script de build)
import { buildPolicy, inlineScriptHashes } from "../../scripts/postbuild-csp.mjs";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe("favoritos: lectura segura de localStorage", () => {
  it.each([
    ["null", null],
    ["JSON inválido", "{no-json"],
    ["número", "42"],
    ["objeto sin slugs", '{"a":1}'],
    ["prototipo contaminado", '{"__proto__":{"slugs":["x"]}}'],
  ])("devuelve lista vacía con datos corruptos (%s)", (_l, raw) => {
    expect(parseFavorites(raw as string | null)).toEqual([]);
  });

  it("descarta valores inválidos, duplicados y HTML", () => {
    const raw = JSON.stringify({ v: 1, slugs: ["cafe-plaza", "cafe-plaza", "<script>", 5, null, "Mayus", "ok-2"] });
    expect(parseFavorites(raw)).toEqual(["cafe-plaza", "ok-2"]);
  });

  it("acepta el formato antiguo (array simple)", () => {
    expect(parseFavorites('["a-b","c"]')).toEqual(["a-b", "c"]);
  });

  it("limita la cantidad y el tamaño", () => {
    const many = JSON.stringify(Array.from({ length: 500 }, (_, i) => `n-${i}`));
    expect(parseFavorites(many, 100)).toHaveLength(100);
    expect(parseFavorites("x".repeat(50_000))).toEqual([]);
  });

  it("agrega, quita y respeta el máximo", () => {
    let r = toggleFavorite([], "a");
    expect(r).toMatchObject({ slugs: ["a"], added: true });
    r = toggleFavorite(r.slugs, "a");
    expect(r).toMatchObject({ slugs: [], added: false });
    expect(toggleFavorite(["a", "b"], "c", 2)).toMatchObject({ limitReached: true, slugs: ["a", "b"] });
    expect(toggleFavorite([], "<bad>").slugs).toEqual([]);
  });

  it("persiste y lee del almacenamiento", () => {
    const storage = memoryStorage();
    expect(writeFavorites(storage, ["a", "b"])).toBe(true);
    expect(storage.data[FAVORITES_KEY]).toBe(serializeFavorites(["a", "b"]));
    expect(readFavorites(storage)).toEqual(["a", "b"]);
    writeFavorites(storage, []);
    expect(storage.data[FAVORITES_KEY]).toBeUndefined();
  });

  it("tolera almacenamiento bloqueado o lleno", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    };
    expect(readFavorites(broken)).toEqual([]);
    expect(writeFavorites(broken, ["a"])).toBe(false);
    expect(readFavorites(null)).toEqual([]);
  });
});

describe("utilidades", () => {
  it("agrupa horarios consecutivos iguales", () => {
    const rows = groupOpeningHours([
      { days: ["mo", "tu", "we", "th", "fr"], opens: "08:00", closes: "12:00" },
      { days: ["mo", "tu", "we", "th", "fr"], opens: "16:00", closes: "20:00" },
      { days: ["sa"], opens: "09:00", closes: "13:00" },
    ]);
    expect(rows).toEqual([
      { label: "Lunes a viernes", ranges: ["08:00–12:00", "16:00–20:00"] },
      { label: "Sábado", ranges: ["09:00–13:00"] },
    ]);
  });

  it("formatea fechas en español sin depender de la zona horaria", () => {
    expect(formatDate("2026-11-01")).toBe("1 de noviembre de 2026");
  });

  it("JSON-LD no permite cerrar la etiqueta script", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

describe("CSP post-build", () => {
  it("calcula hashes solo de scripts inline ejecutables", () => {
    const html =
      '<script>console.log(1)</script><script src="/a.js"></script><script type="application/ld+json">{"a":1}</script>';
    const hashes = inlineScriptHashes(html);
    expect(hashes).toHaveLength(1);
    expect(buildPolicy(hashes)).toContain(`'sha256-${hashes[0]}'`);
    expect(buildPolicy(hashes)).not.toContain("unsafe-inline' 'sha");
    expect(buildPolicy(hashes)).not.toMatch(/script-src[^;]*unsafe-(inline|eval)/);
  });
});
