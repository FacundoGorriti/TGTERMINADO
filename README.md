# TARTAGAL GO

**Directorio digital de comercios, profesionales, servicios y emprendimientos de Tartagal, Salta.**
El portal central de descubrimiento que conecta a las personas con los negocios de su ciudad y con los sitios web propios de cada negocio.

Diseño y desarrollo: **Facundo Gorriti** — Desarrollador web. © 2026, todos los derechos reservados (ver [LICENSE](LICENSE)).

- 100 % frontend y **estático**: Next.js (App Router, `output: "export"`), React, TypeScript estricto y Tailwind CSS.
- Sin base de datos, sin backend, sin cuentas ni formularios. Los datos públicos viven en archivos JSON versionados.
- Búsqueda, filtros y favoritos funcionan en el navegador.
- Validación automática del catálogo con Zod en cada build y en CI.
- Pensado primero para el celular (320–430 px) con una composición propia para escritorio.

---

## Requisitos

- Node.js **22.12 o superior** (ver `.nvmrc`)
- npm 10+

## Inicio rápido

```bash
npm ci                 # instala exactamente las versiones del lockfile
npm run dev            # entorno de desarrollo en http://localhost:3000
```

Build y vista previa del sitio estático, igual que en producción (con cabeceras de seguridad):

```bash
npm run build          # valida catálogo → next build → CSP con hashes → out/
npm start              # sirve out/ en http://localhost:3000 con las cabeceras de vercel.json
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida el catálogo, genera el sitio estático en `out/`, corrige rutas de prefetch y aplica la CSP por página |
| `npm start` | Sirve `out/` localmente con las cabeceras de `vercel.json` (solo pruebas) |
| `npm run lint` | ESLint (incluye reglas que prohíben `eval`, `innerHTML` y `dangerouslySetInnerHTML`) |
| `npm run typecheck` | TypeScript estricto |
| `npm run test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas E2E (Playwright) sobre el build estático. Requiere `npm run build` y `npx playwright install chromium` |
| `npm run catalog:validate` | Valida todos los negocios y el registro de rubros |
| `npm run business:new` | Asistente local para crear un negocio nuevo |
| `npm run audit:deps` | Auditoría de dependencias de producción |
| `npm run verify` | Lint + typecheck + pruebas unitarias + build |

## Agregar un negocio (resumen)

```bash
npm run business:new          # responde las preguntas → crea src/data/businesses/<slug>.json
# completar el archivo, agregar imágenes en public/images/negocios/<slug>/
npm run catalog:validate
git add . && git commit -m "Agrega <negocio>" && git push   # Vercel publica solo
```

Guía completa: [docs/ADDING_BUSINESSES.md](docs/ADDING_BUSINESSES.md).

## Configuración

Todo lo personalizable está en [`src/data/site-config.ts`](src/data/site-config.ts). Los valores que dependen del despliegue se definen como variables **públicas** (ver [`.env.example`](.env.example)):

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canónica (en Vercel, si falta, se usa el dominio `*.vercel.app` del proyecto) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo de contacto público (opcional) |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | WhatsApp público, solo dígitos (opcional) |
| `NEXT_PUBLIC_SHOW_DEMO_BUSINESSES` | `true`/`false`: mostrar los negocios ficticios de demostración |

> Las variables `NEXT_PUBLIC_*` quedan visibles en el navegador. **Nunca** usar para secretos.

## Datos de demostración

El repositorio incluye 10 negocios **ficticios** (`"demo": true`, archivos `src/data/businesses/*-demo-*` y `*-ejemplo-*`) para mostrar el funcionamiento. Se rotulan como “Ejemplo ficticio”, no se indexan (`noindex`), no generan datos estructurados y no aparecen en el sitemap. Para quitarlos: borrar esos archivos y `public/images/demo/`, o definir `NEXT_PUBLIC_SHOW_DEMO_BUSINESSES=false`.

## Documentación

- [docs/ADDING_BUSINESSES.md](docs/ADDING_BUSINESSES.md) — agregar comercios paso a paso
- [docs/ADDING_CATEGORIES.md](docs/ADDING_CATEGORIES.md) — rubros, subrubros y campos contextuales
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — GitHub, Vercel, dominio, variables, verificación y rollback
- [docs/SECURITY.md](docs/SECURITY.md) — modelo de seguridad, controles y limitaciones
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura y decisiones técnicas
- [docs/MAINTENANCE.md](docs/MAINTENANCE.md) — actualizaciones, backups y mantenimiento
- [docs/ROADMAP.md](docs/ROADMAP.md) — mejoras futuras (no implementadas)

## Estructura

```
├── .github/              CI, CodeQL, revisión de dependencias, Dependabot
├── docs/                 Documentación para el propietario
├── public/               Imágenes, íconos, isotipo y theme-init.js
├── scripts/              Validación, asistente de negocios, post-build (CSP), servidor local
├── src/
│   ├── app/              Rutas (App Router)
│   ├── components/       UI: layout, navegación, negocios, rubros, búsqueda, filtros, SEO
│   ├── data/             categories.ts, site-config.ts y businesses/*.json
│   ├── hooks/            useFavorites, useTheme
│   ├── lib/              catálogo, búsqueda, seguridad, SEO, utilidades
│   ├── styles/           Tokens de diseño y estilos globales
│   └── types/
├── tests/unit|e2e/       Vitest y Playwright
├── vercel.json           Despliegue estático y cabeceras de seguridad
└── next.config.ts
```
