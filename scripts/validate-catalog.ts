/**
 * npm run catalog:validate
 * Valida todos los archivos de src/data/businesses y el registro de categorías.
 * Sale con código 1 si hay errores (bloquea el build y la CI).
 */
import { publicFileExists, readCatalogFiles } from "@/lib/catalog/load";
import { formatIssues, validateCatalog } from "@/lib/catalog/validate";
import { siteConfig } from "@/data/site-config";

const files = readCatalogFiles();
const { businesses, errors, warnings } = validateCatalog(files, { fileExists: publicFileExists });

const byStatus = businesses.reduce<Record<string, number>>((acc, b) => {
  acc[b.status] = (acc[b.status] ?? 0) + 1;
  return acc;
}, {});
const demos = businesses.filter((b) => b.demo).length;

console.log("\nTARTAGAL GO · Validación del catálogo");
console.log("─".repeat(44));
console.log(`Archivos analizados: ${files.length}`);
console.log(
  `Válidos: ${businesses.length}  (published: ${byStatus.published ?? 0}, draft: ${byStatus.draft ?? 0}, archived: ${byStatus.archived ?? 0})`,
);
if (demos > 0) {
  console.log(
    `Demostración: ${demos} registros ficticios (${siteConfig.features.showDemoBusinesses ? "VISIBLES" : "ocultos"} según NEXT_PUBLIC_SHOW_DEMO_BUSINESSES)`,
  );
}

if (process.env.VERCEL_ENV === "production") {
  if (!siteConfig.hasConfiguredUrl) {
    errors.push({ file: ".env", message: "NEXT_PUBLIC_SITE_URL no está configurada para producción" });
  } else if (!siteConfig.hasExplicitUrl) {
    warnings.push({
      file: ".env",
      message: `Usando el dominio de Vercel (${siteConfig.url}) como URL canónica. Definí NEXT_PUBLIC_SITE_URL al tener dominio propio.`,
    });
  }
}

if (warnings.length > 0) {
  console.log(`\n⚠ Advertencias (${warnings.length}):\n${formatIssues(warnings)}`);
}

if (errors.length > 0) {
  console.error(`\n✖ Errores (${errors.length}):\n${formatIssues(errors)}\n`);
  process.exit(1);
}

console.log("\n✔ Catálogo válido.\n");
