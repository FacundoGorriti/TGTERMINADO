import { describe, expect, it } from "vitest";
import { validateCatalog, type CatalogFile } from "@/lib/catalog/validate";
import { readCatalogFiles, publicFileExists } from "@/lib/catalog/load";
import { validateCategoryRegistry } from "@/lib/catalog/categories";
import { categories } from "@/data/categories";
import { isVisible } from "@/lib/catalog";
import type { Business } from "@/lib/catalog/schema";

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: "neg-test-1",
    slug: "negocio-de-prueba",
    name: "Negocio de Prueba",
    categoryId: "gastronomia",
    subcategoryId: "cafeterias",
    shortDescription: "Descripción breve de prueba.",
    description: "Descripción completa de prueba.",
    city: "Tartagal",
    province: "Salta",
    websiteUrl: "https://ejemplo.com.ar/",
    publishedAt: "2026-11-01",
    updatedAt: "2026-11-02",
    status: "published",
    ...overrides,
  };
}

function file(data: Record<string, unknown>, name?: string): CatalogFile {
  return { file: `src/data/businesses/${name ?? String(data.slug)}.json`, data };
}

const NOW = new Date("2026-11-21T12:00:00Z");

describe("validación del catálogo", () => {
  it("el catálogo real del repositorio es válido", () => {
    const result = validateCatalog(readCatalogFiles(), { fileExists: publicFileExists, now: NOW });
    expect(result.errors).toEqual([]);
  });

  it("el registro de categorías no tiene ids duplicados ni inválidos", () => {
    expect(validateCategoryRegistry()).toEqual([]);
    const subIds = categories.flatMap((c) => c.subcategories.map((s) => s.id));
    expect(new Set(subIds).size).toBe(subIds.length);
  });

  it("detecta categorías duplicadas en el registro", () => {
    const first = categories[0]!;
    expect(validateCategoryRegistry([first, first]).some((e) => e.includes("duplicada"))).toBe(true);
  });

  it("acepta un registro válido", () => {
    const result = validateCatalog([file(record())], { now: NOW });
    expect(result.errors).toEqual([]);
    expect(result.businesses).toHaveLength(1);
  });

  it("detecta slugs duplicados", () => {
    const result = validateCatalog(
      [file(record()), file(record({ id: "neg-test-2" }), "otro-archivo")],
      { now: NOW },
    );
    expect(result.errors.some((e) => e.message.includes("slug duplicado"))).toBe(true);
  });

  it("detecta ids duplicados", () => {
    const result = validateCatalog([file(record()), file(record({ slug: "otro-negocio" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.includes("id duplicado"))).toBe(true);
  });

  it("detecta categorías inexistentes", () => {
    const result = validateCatalog([file(record({ categoryId: "no-existe" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.includes("categoryId inexistente"))).toBe(true);
  });

  it("detecta subcategorías incompatibles con la categoría", () => {
    const result = validateCatalog([file(record({ subcategoryId: "farmacias" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.includes("no pertenece"))).toBe(true);
  });

  it.each([
    ["javascript:", "javascript:alert(1)"],
    ["data:", "data:text/html,<script>alert(1)</script>"],
    ["http sin TLS", "http://ejemplo.com"],
    ["credenciales embebidas", "https://user:pass@ejemplo.com"],
    ["texto que no es URL", "no es una url"],
  ])("rechaza websiteUrl maliciosa o inválida (%s)", (_label, url) => {
    const result = validateCatalog([file(record({ websiteUrl: url }))], { now: NOW });
    expect(result.errors.some((e) => e.message.startsWith("websiteUrl"))).toBe(true);
  });

  it("exige la web propia del negocio (la tarjeta la abre directamente)", () => {
    const sinWeb: Record<string, unknown> = record();
    delete sinWeb.websiteUrl;
    const result = validateCatalog([file(sinWeb)], { now: NOW });
    expect(result.errors.some((e) => e.message.startsWith("websiteUrl"))).toBe(true);
  });

  it("rechaza redes sociales con dominios no permitidos", () => {
    const result = validateCatalog([file(record({ instagramUrl: "https://instagram.com.evil.io/x" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.startsWith("instagramUrl"))).toBe(true);
  });

  it("rechaza fechas inválidas e inexistentes", () => {
    const bad = validateCatalog([file(record({ publishedAt: "2026-02-30" }))], { now: NOW });
    expect(bad.errors.some((e) => e.message.startsWith("publishedAt"))).toBe(true);
    const order = validateCatalog([file(record({ publishedAt: "2026-11-10", updatedAt: "2026-11-01" }))], { now: NOW });
    expect(order.errors.some((e) => e.message.includes("updatedAt"))).toBe(true);
  });

  it("rechaza estados no reconocidos", () => {
    const result = validateCatalog([file(record({ status: "publicado" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.startsWith("status"))).toBe(true);
  });

  it("rechaza datos obligatorios ausentes", () => {
    const withoutName: Record<string, unknown> = record();
    delete withoutName.name;
    const result = validateCatalog([file(withoutName)], { now: NOW });
    expect(result.errors.some((e) => e.message.startsWith("name"))).toBe(true);
  });

  it("detecta imágenes faltantes", () => {
    const result = validateCatalog([file(record({ logo: "/images/no-existe.webp" }))], {
      now: NOW,
      fileExists: () => false,
    });
    expect(result.errors.some((e) => e.message.includes("Imagen faltante"))).toBe(true);
  });

  it("rechaza rutas de imagen con traversal o externas", () => {
    for (const logo of ["/images/../secret.png", "https://cdn.ejemplo.com/a.png", "/images/a.exe"]) {
      const result = validateCatalog([file(record({ logo }))], { now: NOW });
      expect(result.errors.some((e) => e.message.startsWith("logo"))).toBe(true);
    }
  });

  it("rechaza HTML en textos", () => {
    const result = validateCatalog([file(record({ description: "<img src=x onerror=alert(1)>" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.startsWith("description"))).toBe(true);
  });

  it("rechaza claves desconocidas (errores de tipeo)", () => {
    const result = validateCatalog([file(record({ webiste: "https://x.com" }))], { now: NOW });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("valida campos contextuales según el rubro", () => {
    const ok = validateCatalog([file(record({ attributes: { cuisine: "Cafetería", menuUrl: "https://ejemplo.com/menu" } }))], { now: NOW });
    expect(ok.errors).toEqual([]);
    const wrongField = validateCatalog([file(record({ attributes: { bookingUrl: "https://ejemplo.com" } }))], { now: NOW });
    expect(wrongField.errors.some((e) => e.message.includes("no admitido"))).toBe(true);
    const badUrl = validateCatalog([file(record({ attributes: { menuUrl: "javascript:alert(1)" } }))], { now: NOW });
    expect(badUrl.errors.some((e) => e.message.includes("menuUrl"))).toBe(true);
  });

  it("exige que el archivo se llame igual que el slug", () => {
    const result = validateCatalog([file(record(), "nombre-distinto")], { now: NOW });
    expect(result.errors.some((e) => e.message.includes("debe llamarse"))).toBe(true);
  });

  it("rechaza localidades no admitidas", () => {
    const result = validateCatalog([file(record({ city: "Ciudad Inventada" }))], { now: NOW });
    expect(result.errors.some((e) => e.message.includes("supportedCities"))).toBe(true);
  });

  it("solo los publicados son visibles; los demo dependen de la configuración", () => {
    const base = validateCatalog([file(record())], { now: NOW }).businesses[0] as Business;
    expect(isVisible(base, true)).toBe(true);
    expect(isVisible({ ...base, status: "draft" }, true)).toBe(false);
    expect(isVisible({ ...base, status: "archived" }, true)).toBe(false);
    expect(isVisible({ ...base, demo: true }, false)).toBe(false);
    expect(isVisible({ ...base, demo: true }, true)).toBe(true);
  });
});
