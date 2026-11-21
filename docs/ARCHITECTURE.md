# Arquitectura

## Principio

TARTAGAL GO es el **portal central de descubrimiento**. No administra los negocios ni reemplaza sus sitios:
reúne fichas públicas y las conecta con los canales de cada negocio.

## Vista general

```
src/data/businesses/*.json ─┐
src/data/categories.ts ─────┼─► lib/catalog (validación Zod + consultas) ─► páginas (Server Components, build) ─► out/*.html
src/data/site-config.ts ────┘                                │
                                                             └─► BusinessSummary[] (serializado) ─► componentes cliente
                                                                                                   (búsqueda, filtros, favoritos)
```

- **Generación estática** (`output: "export"`): todas las páginas se generan en el build. No hay servidor Next en ejecución,
  ni rutas API, ni Server Actions.
- Las páginas leen el catálogo con `fs` **solo durante el build** (`lib/catalog/load.ts`).
- Los componentes interactivos reciben un resumen serializable (`BusinessSummary`) y trabajan en el navegador.

## Rutas

| Ruta | Tipo | Notas |
| --- | --- | --- |
| `/` | estática | Hero, buscador (form GET a `/explorar/`, funciona sin JS), rubros, destacados, recientes, descubrimiento, CTA |
| `/explorar/` | estática + cliente | `DirectoryExplorer` dentro de `Suspense` (lee `useSearchParams`). El fallback es la grilla estática (SEO/no-JS) |
| `/categorias/` | estática | Conteos reales por rubro |
| `/categorias/[slug]/` | SSG (`generateStaticParams`) | Explorer con categoría fija |
| `/negocios/[slug]/` | SSG | Ficha + JSON-LD LocalBusiness (excepto demos) |
| `/favoritos/` | estática + cliente | `localStorage`, `noindex` |
| `/nosotros/`, `/sumar-negocio/`, `/contacto/`, `/privacidad/`, `/terminos/` | estáticas | |
| `404` | `not-found.tsx` | Vercel sirve `404.html` |
| `sitemap.xml`, `robots.txt`, `manifest.webmanifest` | `force-static` | |

`dynamicParams = false`: cualquier slug no generado responde 404.
Si el catálogo queda vacío, `/negocios/[slug]` genera un marcador `sin-negocios` que muestra la página 404
(requisito de `output: "export"`, que exige al menos un parámetro).

## Módulos

| Módulo | Responsabilidad |
| --- | --- |
| `lib/catalog/schema.ts` | Esquema Zod del negocio |
| `lib/catalog/validate.ts` | Reglas entre registros (duplicados, rubros, imágenes, campos contextuales) |
| `lib/catalog/load.ts` | Lectura de archivos (solo Node) |
| `lib/catalog/index.ts` | Consultas: visibles, por rubro, destacados, recientes, relacionados, resúmenes |
| `lib/catalog/categories.ts` | Acceso al registro de rubros, campos contextuales y tipo Schema.org |
| `lib/search/engine.ts` | Motor de búsqueda local detrás de la interfaz `SearchEngine` |
| `lib/search/filters.ts` | Filtros, orden y sincronización con la URL (valores validados) |
| `lib/security/urls.ts` | Validación central de enlaces |
| `lib/favorites/storage.ts` | Lectura/escritura segura de favoritos |
| `lib/seo/metadata.ts` | Metadata, canonical, Open Graph, Twitter, BreadcrumbList |
| `components/*` | UI reutilizable (ver lista abajo) |

Componentes principales: `AppHeader`, `MobileBottomNavigation`, `DesktopNavigation`, `SearchBar`, `SearchResults`,
`DirectoryExplorer`, `CategoryCard`, `BusinessCard`, `BusinessGrid`, `BusinessContactActions`, `BusinessAttributes`,
`BusinessHours`, `BusinessGallery`, `CategoryFilters`/`ChipGroup`, `FilterDrawer` (`<dialog>` nativo), `ThemeSwitcher`,
`FavoriteButton`, `Breadcrumbs`, `EmptyState`, `ErrorState`, `Notice`, `Footer`, `BackToTop`, `SectionHeading`,
`ShareButton` (Web Share API o copiar enlace), `ResponsiveImage`, `JsonLd`.

## Decisiones técnicas

| Decisión | Motivo |
| --- | --- |
| JSON por negocio (no TS) | Editable sin conocimientos de programación, no ejecuta código, fácil de generar con `business:new` y de revisar en un PR. |
| Lectura con `fs` en build (no un índice manual) | Agregar un negocio no exige editar ningún otro archivo. |
| Campos contextuales declarados en el registro de rubros | Fichas adaptadas a cada rubro sin un componente por rubro. |
| Búsqueda propia (sin Fuse/Lunr) | Catálogo pequeño; ~100 líneas, sin dependencias, con normalización de acentos y ranking por campo. |
| `SearchEngine` como interfaz | Permite reemplazar el motor (índice precalculado, servicio externo) sin tocar la UI. |
| `useSyncExternalStore` para tema y favoritos | Estado compartido entre componentes y pestañas sin librerías y sin errores de hidratación. |
| Tema con `data-theme` + script externo bloqueante | Sin parpadeo y compatible con una CSP sin `unsafe-inline`. |
| CSP con hashes en post-build | Next export genera scripts inline; los hashes evitan `unsafe-inline`. |
| `framework: null` en Vercel | Se despliega exactamente `out/`, incluidas las modificaciones del post-build. |
| `postbuild-rsc-paths.mjs` | Next 16 escribe los segmentos de prefetch en subcarpetas pero el cliente los pide con nombre aplanado; sin esto, hosting estático devuelve 404. |
| Imágenes `unoptimized` | La optimización de Next requiere servidor. Se exigen imágenes locales ya optimizadas y dimensiones fijas (sin CLS). |
| `trailingSlash: true` | Cada ruta es `ruta/index.html`, compatible con cualquier hosting estático. |
| Sin bibliotecas de UI | Menos JavaScript y control total de accesibilidad. |

## Escalabilidad

| Escenario | Estrategia |
| --- | --- |
| Pocos negocios | Situación actual. |
| Decenas | Sin cambios. Carga progresiva de 24 en 24 en Explorar. |
| Cientos | Sigue siendo viable. Considerar: resumen más liviano para el cliente, imágenes WebP/AVIF estrictas, más subdirectorios de imágenes. |
| Miles | El HTML de Explorar/categorías incluye el resumen de todos los negocios. Pasar a un índice JSON estático cargado bajo demanda (`/search-index.json`) implementando otro `SearchEngine`. |

### Cuándo migrar a una arquitectura con backend

Conviene evaluar un backend (y una base de datos) solo si aparece **alguna** de estas necesidades:

- Que los propios comerciantes editen sus fichas sin pasar por el repositorio (requiere autenticación y permisos).
- Formularios con receptor real (solicitudes de alta, reportes) con almacenamiento y moderación.
- Datos que cambian muchas veces por día (guardias de farmacias, disponibilidad) desde una fuente mantenida.
- Varios miles de registros donde los tiempos de build o el tamaño del índice se vuelvan un problema.
- Estadísticas reales de uso (con consentimiento y política de privacidad actualizada).

Hasta entonces, el modelo estático es más simple, barato y seguro. Esta migración **no** forma parte de esta entrega.
