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
background:#07080b;color:#f2f3ee;display:flex;flex-direction:column;justify-content:center;padding:0 96px;box-sizing:border-box;position:relative;overflow:hidden">
<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(242,243,238,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(242,243,238,.06) 1px,transparent 1px);background-size:56px 56px"></div>
<div style="position:absolute;right:-120px;top:-160px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(200,240,49,.35),transparent 65%)"></div>
<div style="position:relative;display:flex;align-items:center;gap:28px"><img src="${markData}" style="width:120px;height:120px">
<div style="font-size:80px;font-weight:900;letter-spacing:4px">TARTAGAL <span style="background:#c8f031;color:#07080b;border-radius:60px;padding:2px 26px">GO</span></div></div>
<div style="position:relative;margin-top:40px;font-size:44px;font-weight:700">Tu ciudad, <span style="color:#c8f031">conectada.</span></div>
<div style="position:relative;margin-top:14px;font-size:28px;opacity:.65">Comercios y emprendimientos de Tartagal, Salta, cada uno con su web</div></body></html>`;

const jobs = [
  { file: "public/icons/icon-192.png", w: 192, h: 192, html: iconHtml(192, 0, "transparent") },
  { file: "public/icons/icon-512.png", w: 512, h: 512, html: iconHtml(512, 0, "transparent") },
  { file: "public/icons/icon-maskable-512.png", w: 512, h: 512, html: iconHtml(512, 72, "#07080b") },
  { file: "src/app/apple-icon.png", w: 180, h: 180, html: iconHtml(180, 16, "#07080b") },
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
