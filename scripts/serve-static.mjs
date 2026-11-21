/**
 * Servidor estático local para previsualizar out/ como en Vercel:
 * - aplica las cabeceras definidas en vercel.json (incluida la CSP),
 * - redirige a la versión con barra final (trailingSlash),
 * - responde 404 con out/404.html.
 * Uso: npm run build && npm start   (puerto 3000, o PORT=xxxx)
 * Solo para desarrollo y pruebas E2E. No es un servidor de producción.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve("out");
const PORT = Number(process.env.PORT ?? 3000);
const vercel = JSON.parse(fs.readFileSync(path.resolve("vercel.json"), "utf8"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

const headerRules = (vercel.headers ?? []).map((rule) => ({
  re: new RegExp(`^${rule.source.replace(/\(\.\*\)/g, ".*")}$`),
  headers: rule.headers,
}));

function applyHeaders(res, urlPath) {
  for (const rule of headerRules) {
    if (rule.re.test(urlPath)) for (const h of rule.headers) res.setHeader(h.key, h.value);
  }
}

const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

/** Comprime con gzip los recursos de texto (como hace Vercel con brotli/gzip). */
function send(req, res, status, file, urlPath) {
  applyHeaders(res, urlPath);
  const type = TYPES[path.extname(file)] ?? "application/octet-stream";
  const gzip = COMPRESSIBLE.test(type) && /gzip/.test(req.headers["accept-encoding"] ?? "");
  res.writeHead(status, { "Content-Type": type, Vary: "Accept-Encoding", ...(gzip ? { "Content-Encoding": "gzip" } : {}) });
  const stream = fs.createReadStream(file);
  if (gzip) stream.pipe(zlib.createGzip()).pipe(res);
  else stream.pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let urlPath;
  try {
    urlPath = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  const target = path.resolve(ROOT, `.${urlPath}`);
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }

  if (fs.existsSync(target) && fs.statSync(target).isFile()) return send(req, res, 200, target, urlPath);

  const index = path.join(target, "index.html");
  if (fs.existsSync(index)) {
    if (!urlPath.endsWith("/")) {
      applyHeaders(res, urlPath);
      res.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    return send(req, res, 200, index, urlPath);
  }

  const notFound = path.join(ROOT, "404.html");
  if (fs.existsSync(notFound)) return send(req, res, 404, notFound, urlPath);
  res.writeHead(404).end("Not found");
});

server.listen(PORT, () => console.log(`TARTAGAL GO (estático) en http://localhost:${PORT}`));
