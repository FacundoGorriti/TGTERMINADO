# Modelo de seguridad

TARTAGAL GO es un **sitio público y estático**. No existe seguridad absoluta; este documento describe qué se protege,
cómo, y qué queda fuera del alcance del código.

## Superficie de ataque

| Elemento | Situación |
| --- | --- |
| Servidor de aplicación / API propia | **No existe.** Solo archivos estáticos servidos por Vercel. |
| Base de datos, autenticación, paneles | **No existen.** No hay credenciales que robar en el sitio. |
| Entrada de usuarios | Solo la búsqueda y los filtros, procesados en el navegador. Nada se envía a un servidor propio. |
| Datos del catálogo | Archivos JSON versionados, validados en el build. Única vía de cambio: commit en GitHub. |
| Almacenamiento del navegador | `localStorage` con preferencia de tema y lista de favoritos (slugs públicos). |
| Secretos | Ninguno. `.env.example` solo contiene variables públicas; `.env*` está en `.gitignore`. |

> El código JavaScript y el HTML del sitio son **públicos por naturaleza**: cualquiera puede leerlos. No se intenta ocultarlos.

## Controles implementados

### 1. Validación del catálogo (build y CI)

`src/lib/catalog/schema.ts` y `validate.ts` (Zod, `.strict()`), ejecutados por `npm run catalog:validate`, por el build y por las pruebas:

- Rechaza claves desconocidas, tipos incorrectos, fechas inexistentes, estados no reconocidos y datos obligatorios ausentes.
- Rechaza `<` y `>` en todos los textos (no se admite HTML).
- Slugs e ids únicos; categoría y subcategoría existentes y compatibles; localidades admitidas.
- Imágenes: solo rutas locales `/images/...` con extensiones de imagen, sin `..`, y el archivo debe existir.
- URLs: ver punto 3. Los campos contextuales se validan según el tipo declarado para el rubro.

Un catálogo inválido **detiene el build**: Vercel no publica y queda en línea la versión anterior.

### 2. Protección contra XSS

- React escapa todo el texto. Los datos del catálogo se renderizan **siempre como texto**.
- ESLint prohíbe `eval`, `new Function`, `setTimeout` con strings, `innerHTML`, `outerHTML` y `dangerouslySetInnerHTML`.
- **Única excepción documentada**: `src/components/seo/json-ld.tsx` emite datos estructurados Schema.org.
  El objeto lo construye el propio código, se serializa con `JSON.stringify` y se escapan `<`, `>` y `&`
  (probado en `tests/unit/favorites-and-utils.test.ts`), por lo que ningún texto puede cerrar `</script>`.
  Además `type="application/ld+json"` es un bloque de datos que el navegador no ejecuta.
- No se construye HTML concatenando strings.

### 3. Enlaces externos (`src/lib/security/urls.ts`)

- Sitios externos: **solo `https:`**, sin usuario/contraseña embebidos, sin puertos no estándar, sin IPs literales ni `localhost`,
  longitud máxima, sin caracteres de control (evita `java\tscript:`).
- Instagram, Facebook y Google Maps: además se restringe el dominio (coincidencia exacta o subdominio; rechaza `instagram.com.evil.io`).
- `tel:`, WhatsApp (`https://wa.me/<dígitos>`) y `mailto:` se **construyen** a partir de dígitos/direcciones validadas; nunca se aceptan crudos.
- Se rechazan `javascript:`, `data:`, `vbscript:`, `file:` y cualquier otro esquema.
- Todo enlace con `target="_blank"` usa `rel="noopener noreferrer"` (verificado por E2E).
- Doble barrera: el esquema valida en el build y los componentes vuelven a validar al renderizar (un enlace inválido no se muestra).

### 4. Cabeceras y Content-Security-Policy

**Capa 1 — CSP por página con hashes (`scripts/postbuild-csp.mjs`)**
Next.js inserta scripts inline (payload de React Server Components). En lugar de permitir `'unsafe-inline'`,
el post-build calcula el SHA-256 de cada script inline de cada HTML y agrega:

```
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-…' …; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; media-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">
```

El build falla si algún HTML no puede protegerse o si hay un `<script>` antes de la CSP.
**Sin `unsafe-eval` y sin `unsafe-inline` en `script-src`.**

**Capa 2 — cabeceras HTTP (`vercel.json`)**

| Cabecera | Valor | Motivo |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; … frame-ancestors 'none'; upgrade-insecure-requests` | `frame-ancestors` no se admite en `<meta>`. Ver nota. |
| `X-Content-Type-Options` | `nosniff` | Evita interpretación errónea de tipos. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No filtra rutas/búsquedas a sitios externos. |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pagos, etc. desactivados | El sitio no los usa. |
| `X-Frame-Options` | `DENY` | Anti-clickjacking para navegadores antiguos. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aislamiento de ventanas. |
| `Cross-Origin-Resource-Policy` | `same-origin` | Evita que otros sitios incrusten los recursos. |
| `Strict-Transport-Security` | `max-age=63072000` | Fuerza HTTPS. Se omite `includeSubDomains`/`preload` para no afectar subdominios ajenos al sitio; agregarlos solo si todos los subdominios usan HTTPS. |

**Nota sobre `'unsafe-inline'` en la cabecera**: cuando existen varias políticas, el navegador aplica **todas** (intersección).
La CSP de `<meta>` solo autoriza los hashes exactos, así que un script inline inyectado sería bloqueado por ella.
La cabecera no puede llevar los hashes porque son distintos en cada página (y con cientos de negocios superarían
el tamaño razonable de una cabecera). La cabecera sigue restringiendo orígenes externos (`'self'`) para cualquier respuesta
sin `<meta>` (por ejemplo, un SVG abierto directamente).

**Excepción justificada: `style-src 'unsafe-inline'`**. React/Next generan atributos `style` (por ejemplo, `next/image` con `fill`
y las variables de las fuentes). El riesgo de inyección de estilos es bajo porque no se renderiza HTML de terceros.

**Tema sin script inline**: el script que evita el parpadeo de tema está en `public/theme-init.js` (archivo propio, `'self'`).

**Fuentes autohospedadas**: `next/font` descarga Inter y Sora en el build y las sirve desde el propio dominio. No hay CDNs externos.

Verificación: `tests/e2e/features.spec.ts` comprueba las cabeceras (servidas por `scripts/serve-static.mjs`, que replica
`vercel.json`), la presencia de la CSP con hashes y la ausencia de violaciones en consola al navegar y buscar.
**En producción**, verificar también sobre el dominio real (ver DEPLOYMENT.md §7).

### 5. Datos locales (`src/lib/favorites/storage.ts`)

- Todo lo leído de `localStorage` se valida: JSON inválido, tipos incorrectos, slugs con formato no permitido o duplicados se descartan.
- Máximo 100 favoritos y 20 KB de datos; tolera almacenamiento bloqueado o lleno (modo privado).
- Solo se guardan slugs públicos y la preferencia de tema. Nada sensible.
- El estado del navegador nunca se usa para decisiones de seguridad.

### 6. Dependencias y GitHub

- `package-lock.json` versionado; CI usa `npm ci`; versiones exactas en `package.json`.
- `npm audit --omit=dev --audit-level=high` en CI; Dependabot semanal (npm y GitHub Actions); *Dependency Review* en PRs.
- CodeQL (`security-extended`) en cada push/PR y semanalmente.
- Workflows con `permissions: contents: read` (CodeQL agrega solo `security-events: write`), `persist-credentials: false`
  y acciones **fijadas por SHA**.
- Se usa `pull_request` (no `pull_request_target`): el código de forks nunca corre con secretos (además, no hay secretos).
- Dependencias mínimas: Next, React, Lucide y Zod en producción.

## Lo que el código NO puede garantizar

- **DDoS, scraping o abuso de tráfico**: dependen de la infraestructura de Vercel. JavaScript no puede impedirlos.
- **Privacidad del código**: todo lo que se envía al navegador es público.
- **Integridad de los datos de terceros**: la veracidad de cada ficha depende de la revisión manual antes de publicar.
- **Seguridad de los sitios externos** a los que se enlaza.
- **Cuentas**: la seguridad de GitHub, Vercel y el registrador del dominio depende de contraseñas fuertes y 2FA.

## Reporte de vulnerabilidades

Comunicar problemas de seguridad por el canal de contacto oficial (no en issues públicos). Responsable: **[pendiente de definir]**.
