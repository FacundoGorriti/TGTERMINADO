/**
 * Post-build: Content-Security-Policy por página basada en hashes.
 * ---------------------------------------------------------------------------
 * Next.js (export estático) inserta scripts inline con el payload de React Server
 * Components. Para NO usar 'unsafe-inline' en script-src, este script:
 *   1. Recorre cada .html de out/.
 *   2. Calcula el SHA-256 de cada <script> inline ejecutable.
 *   3. Inserta <meta http-equiv="Content-Security-Policy"> con esos hashes,
 *      inmediatamente después de <meta charset>, antes de cualquier script.
 * Falla el build si algún HTML no puede protegerse.
 *
 * La cabecera HTTP de vercel.json agrega frame-ancestors (no admitido en <meta>)
 * y actúa como segunda capa. Ver docs/SECURITY.md.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.resolve(process.argv[2] ?? "out");
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const JS_TYPES = new Set(["", "text/javascript", "application/javascript", "module"]);

export function buildPolicy(hashes) {
  const scriptSrc = ["'self'", ...[...new Set(hashes)].map((h) => `'sha256-${h}'`)].join(" ");
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // Estilos: Next/React generan atributos style (p. ej. next/image fill). Ver docs/SECURITY.md.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    "frame-src 'none'",
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function inlineScriptHashes(html) {
  const hashes = [];
  for (const match of html.matchAll(SCRIPT_RE)) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    if (/\ssrc\s*=/i.test(attrs)) continue;
    const type = (/\stype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1] ?? "").toLowerCase();
    if (!JS_TYPES.has(type)) continue; // application/ld+json y similares: bloques de datos, no se ejecutan
    if (body.length === 0) continue;
    hashes.push(crypto.createHash("sha256").update(body, "utf8").digest("base64"));
  }
  return hashes;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith(".html") ? [full] : [];
  });
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(`✖ No existe ${OUT_DIR}. Ejecutá "next build" primero.`);
    process.exit(1);
  }
  const files = walk(OUT_DIR);
  let totalHashes = 0;
  const failures = [];

  for (const file of files) {
    let html = fs.readFileSync(file, "utf8");
    if (html.includes('http-equiv="Content-Security-Policy"')) {
      failures.push(`${file}: ya contiene una CSP (¿build ejecutado dos veces?)`);
      continue;
    }
    const hashes = inlineScriptHashes(html);
    totalHashes += hashes.length;
    const meta = `<meta http-equiv="Content-Security-Policy" content="${buildPolicy(hashes)}"/>`;
    const charset = /<meta charset="utf-8"\s*\/?>/i.exec(html);
    if (charset) {
      const at = charset.index + charset[0].length;
      html = html.slice(0, at) + meta + html.slice(at);
    } else if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => m + meta);
    } else {
      failures.push(`${file}: sin <head>`);
      continue;
    }
    // Verificación: la CSP debe preceder a cualquier <script>.
    const cspAt = html.indexOf(meta);
    const firstScript = html.search(/<script\b/i);
    if (firstScript !== -1 && firstScript < cspAt) {
      failures.push(`${file}: hay un <script> antes de la CSP`);
      continue;
    }
    fs.writeFileSync(file, html);
  }

  if (failures.length > 0) {
    console.error(`✖ CSP: ${failures.length} archivos con problemas:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`✔ CSP con hashes aplicada a ${files.length} páginas HTML (${totalHashes} scripts inline autorizados por hash).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
