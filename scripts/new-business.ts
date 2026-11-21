/**
 * npm run business:new
 * Herramienta LOCAL (no se ejecuta en producción) que crea un archivo de negocio
 * validado en src/data/businesses/<slug>.json.
 *
 * Modo interactivo:   npm run business:new
 * Modo con argumentos: npm run business:new -- --name "Mi Negocio" --category gastronomia \
 *                       --sub cafeterias --short "Descripción breve" --web https://minegocio.com.ar --yes
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getCategories, getCategory } from "@/lib/catalog/categories";
import { BUSINESSES_DIR, readCatalogFiles } from "@/lib/catalog/load";
import { businessSchema } from "@/lib/catalog/schema";
import { formatIssues, validateCatalog } from "@/lib/catalog/validate";
import { siteConfig } from "@/data/site-config";
import { safeHttpsUrl } from "@/lib/security/urls";

type Args = Record<string, string | true>;

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key?.startsWith("--")) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key.slice(2)] = true;
    else {
      args[key.slice(2)] = next;
      i++;
    }
  }
  return args;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function todayInArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Salta" }).format(new Date());
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const nonInteractive = args.yes === true;
  const rl = nonInteractive ? null : readline.createInterface({ input, output });

  async function ask(label: string, fallback = "", validate?: (v: string) => string | null): Promise<string> {
    for (;;) {
      const value = rl ? (await rl.question(`${label}${fallback ? ` [${fallback}]` : ""}: `)).trim() || fallback : fallback;
      const problem = validate?.(value) ?? null;
      if (!problem) return value;
      if (!rl) throw new Error(`${label}: ${problem}`);
      console.log(`  ✖ ${problem}`);
    }
  }

  console.log("\nTARTAGAL GO · Nuevo negocio\n");
  const existing = new Set(readCatalogFiles().map((f) => path.basename(f.file, ".json")));

  const name = await ask("Nombre comercial", String(args.name ?? ""), (v) => (v.length >= 2 ? null : "Obligatorio"));
  const slug = await ask("Slug (URL)", String(args.slug ?? slugify(name)), (v) =>
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) ? "Solo minúsculas, números y guiones" : existing.has(v) ? "Ya existe un negocio con ese slug" : null,
  );

  const categories = getCategories();
  if (rl) categories.forEach((c, i) => console.log(`  ${String(i + 1).padStart(2)}. ${c.name} (${c.id})`));
  const categoryInput = await ask("Categoría (número o id)", String(args.category ?? ""), (v) => {
    const byIndex = categories[Number(v) - 1];
    return byIndex || getCategory(v) ? null : "Categoría inexistente";
  });
  const category = categories[Number(categoryInput) - 1] ?? getCategory(categoryInput)!;

  if (rl) category.subcategories.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}. ${s.name} (${s.id})`));
  const subInput = await ask("Subcategoría (número o id)", String(args.sub ?? ""), (v) => {
    const ok = category.subcategories[Number(v) - 1] ?? category.subcategories.find((s) => s.id === v);
    return ok ? null : "Subcategoría no válida para esta categoría";
  });
  const sub = category.subcategories[Number(subInput) - 1] ?? category.subcategories.find((s) => s.id === subInput)!;

  const shortDescription = await ask("Descripción breve (máx. 160)", String(args.short ?? ""), (v) =>
    v.length < 10 || v.length > 160 ? "Entre 10 y 160 caracteres" : null,
  );
  const cities: readonly string[] = siteConfig.location.supportedCities;
  const city = await ask("Localidad", String(args.city ?? siteConfig.location.mainCity), (v) =>
    cities.includes(v) ? null : `Debe ser una de: ${cities.join(", ")}`,
  );
  const websiteUrl = await ask("Sitio web (https://..., opcional)", String(args.web ?? ""), (v) =>
    !v || safeHttpsUrl(v) ? null : "Debe ser una URL https:// válida",
  );
  const whatsapp = await ask("WhatsApp internacional, solo dígitos (opcional)", String(args.whatsapp ?? ""), (v) =>
    !v || /^\d{10,15}$/.test(v) ? null : "Ej: 5493873000000",
  );
  const status = await ask("Estado (draft/published)", String(args.status ?? "draft"), (v) =>
    v === "draft" || v === "published" ? null : "draft o published",
  );
  rl?.close();

  const today = todayInArgentina();
  const record = {
    id: `neg-${crypto.randomBytes(4).toString("hex")}`,
    slug,
    name,
    categoryId: category.id,
    subcategoryId: sub.id,
    shortDescription,
    description: shortDescription,
    gallery: [],
    city,
    province: siteConfig.location.province,
    ...(websiteUrl ? { websiteUrl } : {}),
    ...(whatsapp ? { whatsapp } : {}),
    openingHours: [],
    features: [],
    keywords: [],
    attributes: {},
    featured: false,
    publishedAt: today,
    updatedAt: today,
    status,
    demo: false,
  };

  const parsed = businessSchema.safeParse(record);
  if (!parsed.success) {
    console.error("✖ El registro generado no es válido:", parsed.error.issues);
    process.exit(1);
  }
  const fileName = `${slug}.json`;
  const check = validateCatalog([...readCatalogFiles(), { file: `src/data/businesses/${fileName}`, data: record }]);
  const ownErrors = check.errors.filter((e) => e.file.endsWith(fileName) || e.message.includes(slug));
  if (ownErrors.length > 0) {
    console.error(`✖ No se creó el archivo:\n${formatIssues(ownErrors)}`);
    process.exit(1);
  }

  const target = path.join(BUSINESSES_DIR, fileName);
  fs.mkdirSync(BUSINESSES_DIR, { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });

  const fields = [...category.profileFields, ...(sub.extraFields ?? [])].map((f) => `${f.key} (${f.type})`);
  console.log(`\n✔ Creado ${path.relative(process.cwd(), target)}`);
  console.log("\nPróximos pasos:");
  console.log("  1. Completar description, address, publicPhone, openingHours, features, etc.");
  console.log("  2. Agregar imágenes en public/images/negocios/" + slug + "/ y referenciarlas en logo / coverImage.");
  console.log(`  3. Campos contextuales admitidos en "attributes": ${fields.join(", ")}`);
  console.log('  4. Cambiar status a "published" cuando esté listo.');
  console.log("  5. npm run catalog:validate  →  git add . && git commit && git push\n");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
