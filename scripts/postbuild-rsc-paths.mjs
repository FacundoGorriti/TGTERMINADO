/**
 * Post-build: compatibilidad de los segmentos de prefetch de Next.js 16 en hosting estático.
 * ---------------------------------------------------------------------------
 * `next build` (output: "export") escribe los segmentos de prefetch anidados:
 *     out/explorar/__next.explorar/__PAGE__.txt
 * pero el router del cliente los solicita con el nombre "aplanado":
 *     /explorar/__next.explorar.__PAGE__.txt
 * En un hosting puramente estático eso produce 404 (y errores en consola).
 * Este script crea una copia con el nombre aplanado junto a cada carpeta __next.*.
 * Es idempotente y no modifica ni elimina los archivos originales.
 */
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(process.argv[2] ?? "out");

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? filesUnder(full) : [full];
  });
}

function walkDirs(dir, visit) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) visit(dir, full);
    else walkDirs(full, visit);
  }
}

let copies = 0;
walkDirs(OUT_DIR, (parent, segmentDir) => {
  for (const file of filesUnder(segmentDir)) {
    const relative = path.relative(parent, file).split(path.sep).join(".");
    const target = path.join(parent, relative);
    if (!fs.existsSync(target)) {
      fs.copyFileSync(file, target);
      copies++;
    }
  }
});

console.log(`✔ Segmentos de prefetch: ${copies} archivos aplanados para hosting estático.`);
