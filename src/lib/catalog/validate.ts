import { siteConfig } from "@/data/site-config";
import { getCategory, getProfileFields, validateCategoryRegistry } from "@/lib/catalog/categories";
import { businessSchema, type Business } from "@/lib/catalog/schema";
import { safeHttpsUrl } from "@/lib/security/urls";

export interface CatalogFile {
  /** Ruta del archivo (para mensajes de error). */
  file: string;
  data: unknown;
}

export interface ValidationIssue {
  file: string;
  message: string;
}

export interface ValidationResult {
  businesses: Business[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidateOptions {
  /** Verifica que una ruta pública (ej. /images/x.webp) exista. Omitir para no comprobar archivos. */
  fileExists?: (publicPath: string) => boolean;
  /** Fecha de referencia para advertir fechas futuras (por defecto: hoy). */
  now?: Date;
}

/**
 * Valida el catálogo completo: esquema de cada archivo + reglas entre registros.
 * Es la misma función que usan `npm run catalog:validate`, el build y las pruebas.
 */
export function validateCatalog(files: CatalogFile[], options: ValidateOptions = {}): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const businesses: Business[] = [];
  const ids = new Map<string, string>();
  const slugs = new Map<string, string>();
  const now = options.now ?? new Date();
  const supportedCities: readonly string[] = siteConfig.location.supportedCities;

  for (const message of validateCategoryRegistry()) {
    errors.push({ file: "src/data/categories.ts", message });
  }

  for (const { file, data } of files) {
    const parsed = businessSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.length ? issue.path.join(".") : "(raíz)";
        errors.push({ file, message: `${path}: ${issue.message}` });
      }
      continue;
    }
    const b = parsed.data;
    const err = (message: string) => errors.push({ file, message });

    // Convención: nombre de archivo = slug, para encontrar cada negocio fácilmente.
    const expectedFile = `${b.slug}.json`;
    if (!file.endsWith(`/${expectedFile}`) && file !== expectedFile) {
      err(`El archivo debe llamarse "${expectedFile}" (igual que el slug)`);
    }

    const prevId = ids.get(b.id);
    if (prevId) err(`id duplicado "${b.id}" (también en ${prevId})`);
    ids.set(b.id, file);

    const prevSlug = slugs.get(b.slug);
    if (prevSlug) err(`slug duplicado "${b.slug}" (también en ${prevSlug})`);
    slugs.set(b.slug, file);

    const category = getCategory(b.categoryId);
    if (!category) {
      err(`categoryId inexistente: "${b.categoryId}"`);
    } else if (!category.subcategories.some((s) => s.id === b.subcategoryId)) {
      err(`subcategoryId "${b.subcategoryId}" no pertenece a la categoría "${b.categoryId}"`);
    } else {
      const fields = new Map(getProfileFields(b.categoryId, b.subcategoryId).map((f) => [f.key, f]));
      for (const [key, value] of Object.entries(b.attributes)) {
        const field = fields.get(key);
        if (!field) {
          err(`attributes.${key}: campo no admitido para este rubro (admitidos: ${[...fields.keys()].join(", ")})`);
          continue;
        }
        if (field.type === "list" && !Array.isArray(value)) err(`attributes.${key}: debe ser una lista`);
        if (field.type !== "list" && typeof value !== "string") err(`attributes.${key}: debe ser texto`);
        if (field.type === "url" && typeof value === "string" && safeHttpsUrl(value) === null) {
          err(`attributes.${key}: URL inválida (solo https://)`);
        }
      }
    }

    if (!supportedCities.includes(b.city)) {
      err(`city "${b.city}" no está en siteConfig.location.supportedCities`);
    }

    if (b.updatedAt < b.publishedAt) err("updatedAt no puede ser anterior a publishedAt");
    const tomorrow = new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10);
    if (b.publishedAt > tomorrow) warnings.push({ file, message: "publishedAt está en el futuro" });

    for (const h of b.openingHours) {
      if (h.opens === h.closes) err(`openingHours: apertura y cierre iguales (${h.opens})`);
    }

    if (options.fileExists) {
      const images = [b.logo, b.coverImage, ...b.gallery.map((g) => g.src)].filter(
        (img): img is string => typeof img === "string",
      );
      for (const img of images) {
        if (!options.fileExists(img)) err(`Imagen faltante: public${img}`);
      }
    }

    const hasContact =
      b.websiteUrl || b.whatsapp || b.publicPhone || b.mapsUrl || b.instagramUrl || b.facebookUrl;
    if (b.status === "published" && !hasContact && !b.demo) {
      warnings.push({ file, message: "Publicado sin ningún medio de contacto ni sitio web" });
    }
    if (b.featured && b.status !== "published") {
      warnings.push({ file, message: "featured=true no tiene efecto si el estado no es published" });
    }

    businesses.push(b);
  }

  return { businesses, errors, warnings };
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((i) => `  • ${i.file}: ${i.message}`).join("\n");
}
