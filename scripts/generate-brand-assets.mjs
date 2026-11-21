/**
 * Genera los PNG de marca (íconos de la app e imagen Open Graph) a partir del isotipo SVG.
 * Herramienta LOCAL de un solo uso: los PNG resultantes se versionan en public/.
 * Requiere el navegador de Playwright:  npx playwright install chromium
 * Uso: node scripts/generate-brand-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const mark = fs.readFileSync(path.resolve("public/branding/isotipo.svg"), "utf8");
const markData = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

const iconHtml = (size, padding, bg) => `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center">
<img src="${markData}" style="width:${size - padding * 2}px;height:${size - padding * 2}px"></body></html>`;

const ogHtml = `<!doctype html><html><body style="margin:0;width:1200px;height:630px;font-family:'Segoe UI',system-ui,sans-serif;
background:radial-gradient(120% 90% at 85% -10%,#315d91 0%,#101d35 42%,#090b0f 78%);color:#f5f2ea;display:flex;flex-direction:column;justify-content:center;padding:0 96px;box-sizing:border-box">
<div style="display:flex;align-items:center;gap:28px"><img src="${markData}" style="width:120px;height:120px">
<div style="font-size:84px;font-weight:800;letter-spacing:6px">TARTAGAL<span style="color:#9cbde6"> GO</span></div></div>
<div style="margin-top:36px;font-size:40px;opacity:.85">Directorio digital de Tartagal, Salta</div>
<div style="margin-top:14px;font-size:28px;opacity:.6">Comercios · Profesionales · Servicios · Emprendimientos</div></body></html>`;

const jobs = [
  { file: "public/icons/icon-192.png", w: 192, h: 192, html: iconHtml(192, 0, "transparent") },
  { file: "public/icons/icon-512.png", w: 512, h: 512, html: iconHtml(512, 0, "transparent") },
  { file: "public/icons/icon-maskable-512.png", w: 512, h: 512, html: iconHtml(512, 72, "#101d35") },
  { file: "src/app/apple-icon.png", w: 180, h: 180, html: iconHtml(180, 16, "#101d35") },
  { file: "public/branding/og-image.png", w: 1200, h: 630, html: ogHtml },
];

const browser = await chromium.launch();
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.w, height: job.h } });
  await page.setContent(job.html);
  await page.screenshot({ path: job.file, omitBackground: job.html.includes("transparent") });
  await page.close();
  console.log(`✔ ${job.file}`);
}
await browser.close();
