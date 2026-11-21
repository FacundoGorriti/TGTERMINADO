import { describe, expect, it } from "vitest";
import { createBusinessSearch, normalizeText, tokenize } from "@/lib/search/engine";
import { applyFilters, EMPTY_FILTERS, filtersToQuery, parseFilters, type FilterDomain } from "@/lib/search/filters";
import type { BusinessSummary } from "@/types/business";

function summary(overrides: Partial<BusinessSummary>): BusinessSummary {
  return {
    slug: "x",
    name: "X",
    shortDescription: "",
    categoryId: "gastronomia",
    categoryName: "Gastronomía",
    subcategoryId: "cafeterias",
    subcategoryName: "Cafeterías",
    city: "Tartagal",
    logo: null,
    coverImage: null,
    websiteUrl: "https://ejemplo.com.ar/",
    hasWebsite: true,
    hasWhatsapp: false,
    featured: false,
    demo: false,
    publishedAt: "2026-01-01",
    searchText: { description: "", features: [], keywords: [] },
    ...overrides,
  };
}

const DATA: BusinessSummary[] = [
  summary({ slug: "cafe-plaza", name: "Café La Plaza", hasWebsite: true, publishedAt: "2026-10-01" }),
  summary({
    slug: "farmacia-norte",
    name: "Farmacia Norte",
    categoryId: "salud-y-bienestar",
    categoryName: "Salud y bienestar",
    subcategoryId: "farmacias",
    subcategoryName: "Farmacias",
    shortDescription: "Perfumería y medicamentos",
    publishedAt: "2026-11-01",
    searchText: { description: "Atención con café de cortesía", features: ["Perfumería"], keywords: ["remedios"] },
  }),
  summary({
    slug: "panaderia-mosconi",
    name: "Panadería Ñandú",
    subcategoryId: "panaderias",
    subcategoryName: "Panaderías",
    city: "General Mosconi",
    publishedAt: "2026-09-01",
    hasWebsite: true,
  }),
];

const DOMAIN: FilterDomain = {
  categoryIds: new Set(["gastronomia", "salud-y-bienestar"]),
  subcategoryParent: new Map([
    ["cafeterias", "gastronomia"],
    ["panaderias", "gastronomia"],
    ["farmacias", "salud-y-bienestar"],
  ]),
  cities: new Set(["Tartagal", "General Mosconi"]),
};

describe("normalización", () => {
  it("ignora acentos, mayúsculas y signos", () => {
    expect(normalizeText("CAFÉ, Ñandú!")).toBe("cafe nandu");
    expect(tokenize("  Farmacía   NORTE ")).toEqual(["farmacia", "norte"]);
  });

  it("limita longitud y cantidad de palabras", () => {
    expect(tokenize("a ".repeat(50)).length).toBeLessThanOrEqual(8);
  });
});

describe("búsqueda", () => {
  const engine = createBusinessSearch(DATA);

  it("encuentra sin acentos y sin distinguir mayúsculas", () => {
    expect(engine.search("cafe")[0]?.item.slug).toBe("cafe-plaza");
    expect(engine.search("NANDU")[0]?.item.slug).toBe("panaderia-mosconi");
  });

  it("encuentra coincidencias parciales (prefijos)", () => {
    expect(engine.search("farm").map((h) => h.item.slug)).toContain("farmacia-norte");
  });

  it("prioriza coincidencias en el nombre sobre la descripción", () => {
    const hits = engine.search("cafe").map((h) => h.item.slug);
    expect(hits).toEqual(["cafe-plaza", "farmacia-norte"]);
  });

  it("busca por rubro, servicios, palabras clave y localidad", () => {
    expect(engine.search("farmacias")[0]?.item.slug).toBe("farmacia-norte");
    expect(engine.search("remedios")[0]?.item.slug).toBe("farmacia-norte");
    expect(engine.search("mosconi")[0]?.item.slug).toBe("panaderia-mosconi");
  });

  it("exige que todas las palabras coincidan", () => {
    expect(engine.search("farmacia mosconi")).toEqual([]);
  });

  it("devuelve vacío cuando no hay coincidencias", () => {
    expect(engine.search("zzzzzz")).toEqual([]);
  });
});

describe("filtros combinados", () => {
  it("combina categoría, localidad y sitio web", () => {
    const r = applyFilters(DATA, { ...EMPTY_FILTERS, category: "gastronomia", city: "General Mosconi", onlyWithWebsite: true });
    expect(r.map((b) => b.slug)).toEqual(["panaderia-mosconi"]);
  });

  it("combina búsqueda y subcategoría", () => {
    const r = applyFilters(DATA, { ...EMPTY_FILTERS, q: "cafe", subcategory: "cafeterias" });
    expect(r.map((b) => b.slug)).toEqual(["cafe-plaza"]);
  });

  it("ordena alfabéticamente y por fecha", () => {
    expect(applyFilters(DATA, { ...EMPTY_FILTERS, sort: "az" }).map((b) => b.slug)).toEqual([
      "cafe-plaza",
      "farmacia-norte",
      "panaderia-mosconi",
    ]);
    expect(applyFilters(DATA, { ...EMPTY_FILTERS, sort: "recent" }).map((b) => b.slug)).toEqual([
      "farmacia-norte",
      "cafe-plaza",
      "panaderia-mosconi",
    ]);
  });
});

describe("sincronización con la URL", () => {
  it("ida y vuelta de filtros ↔ query string", () => {
    const filters = { ...EMPTY_FILTERS, q: "café", category: "gastronomia", subcategory: "cafeterias", city: "Tartagal", onlyWithWebsite: true, sort: "az" as const };
    const query = filtersToQuery(filters);
    expect(parseFilters(new URLSearchParams(query), DOMAIN)).toEqual(filters);
  });

  it("ignora valores desconocidos o manipulados", () => {
    const parsed = parseFilters(new URLSearchParams("cat=<script>&sub=nope&city=Otra&sort=drop&web=yes"), DOMAIN);
    expect(parsed).toEqual(EMPTY_FILTERS);
  });

  it("deduce la categoría a partir de la subcategoría", () => {
    expect(parseFilters(new URLSearchParams("sub=farmacias"), DOMAIN).category).toBe("salud-y-bienestar");
  });

  it("descarta subcategorías incompatibles con la categoría fija", () => {
    const parsed = parseFilters(new URLSearchParams("sub=farmacias"), DOMAIN, { category: "gastronomia" });
    expect(parsed.category).toBe("gastronomia");
    expect(parsed.subcategory).toBeNull();
  });
});
