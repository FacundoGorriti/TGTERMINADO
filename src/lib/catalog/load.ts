import fs from "node:fs";
import path from "node:path";
import type { Business } from "@/lib/catalog/schema";
import { formatIssues, validateCatalog, type CatalogFile } from "@/lib/catalog/validate";

/**
 * Lectura de archivos del catálogo. SOLO se ejecuta en Node (build estático,
 * scripts y pruebas). Nunca se importa desde componentes de cliente.
 */

export const BUSINESSES_DIR = path.join(process.cwd(), "src", "data", "businesses");
export const PUBLIC_DIR = path.join(process.cwd(), "public");

export function readCatalogFiles(dir: string = BUSINESSES_DIR): CatalogFile[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .sort()
    .map((name) => {
      const full = path.join(dir, name);
      const relative = path.relative(process.cwd(), full).split(path.sep).join("/");
      try {
        return { file: relative, data: JSON.parse(fs.readFileSync(full, "utf8")) as unknown };
      } catch (error) {
        return { file: relative, data: { __jsonError: String(error) } };
      }
    });
}

export function publicFileExists(publicPath: string): boolean {
  const resolved = path.resolve(PUBLIC_DIR, `.${publicPath}`);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep)) return false;
  return fs.existsSync(resolved) && fs.statSync(resolved).isFile();
}

let cache: Business[] | null = null;

/** Todos los registros válidos (cualquier estado). Lanza error si el catálogo es inválido. */
export function loadCatalog(): Business[] {
  if (cache) return cache;
  const result = validateCatalog(readCatalogFiles(), { fileExists: publicFileExists });
  if (result.errors.length > 0) {
    throw new Error(`Catálogo inválido (${result.errors.length} errores):\n${formatIssues(result.errors)}`);
  }
  cache = result.businesses;
  return cache;
}
