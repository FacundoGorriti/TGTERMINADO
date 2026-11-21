# Roadmap (no implementado en esta entrega)

Ideas ordenadas por valor estimado. Ninguna está implementada; cada una debe evaluarse según su costo y su impacto en
seguridad y privacidad.

## Corto plazo (sin backend)

- **“Abierto ahora”** calculado en el navegador a partir de `openingHours` (zona horaria `America/Argentina/Salta`), con aviso
  de que los horarios pueden variar.
- **Imágenes Open Graph por negocio** generadas en el build (hoy se usa la imagen general del sitio).
- **Índice de búsqueda en archivo aparte** (`/search-index.json`) cargado bajo demanda, para catálogos de cientos de negocios.
- **Páginas por localidad** (`/localidades/general-mosconi/`) para SEO regional del norte salteño.
- **Mapa** de negocios con coordenadas reales provistas por cada titular (sin inventar ubicaciones), usando una biblioteca
  liviana y ajustando la CSP.
- **Modo sin conexión** (service worker) para consultar favoritos sin señal.
- **Analítica respetuosa de la privacidad** (sin cookies), con actualización previa de la política de privacidad.

## Mediano plazo (requiere decisiones de infraestructura)

- **Formulario de solicitud de alta** con un receptor real (servicio de formularios o backend propio), protección anti-spam
  y política de privacidad actualizada.
- **Guardias de farmacias** desde una fuente oficial y mantenida.
- **Panel para comerciantes** con autenticación real para editar su ficha (implica backend, base de datos y permisos).
  Ver criterios de migración en ARCHITECTURE.md.

## Calidad y operación

- Medición periódica de Lighthouse/Core Web Vitals en CI (Lighthouse CI) sobre la URL de vista previa de Vercel.
- Comprobación automática de enlaces externos caídos (tarea programada semanal).
- Pruebas visuales de regresión (capturas de Playwright).
