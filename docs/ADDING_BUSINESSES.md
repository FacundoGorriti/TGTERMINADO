# Cómo agregar un negocio

Cada negocio es **un archivo JSON** en `src/data/businesses/`, con el mismo nombre que su `slug`
(por ejemplo `src/data/businesses/panaderia-san-martin.json`). No hace falta tocar componentes, rutas ni páginas:
la ficha, los listados, el buscador, los filtros, los contadores y el sitemap se generan solos.

## Procedimiento completo

1. **Desarrollá y publicá** la web independiente del negocio en su dominio o subdominio (con HTTPS).
2. **Creá el registro**:
   ```bash
   npm run business:new
   ```
   El asistente pregunta nombre, slug, rubro, subrubro, descripción breve, localidad, sitio web, WhatsApp y estado,
   valida todo y crea el archivo. También se puede usar sin preguntas:
   ```bash
   npm run business:new -- --name "Panadería San Martín" --category gastronomia --sub panaderias --short "Pan artesanal y facturas todos los días" --web https://panaderiasanmartin.com.ar --yes
   ```
   Alternativa manual: copiar `src/data/businesses/_plantilla.json` (los archivos que empiezan con `_` se ignoran).
3. **Completá la información pública** en el archivo (dirección, horarios, teléfono, redes, servicios…).
4. **Agregá imágenes** en `public/images/negocios/<slug>/` y referencialas como `/images/negocios/<slug>/logo.webp`.
5. **Validá**:
   ```bash
   npm run catalog:validate
   ```
6. **Revisá localmente** (opcional): `npm run dev` y abrí `http://localhost:3000/negocios/<slug>/`.
   Los registros en `draft` no se muestran: cambiá a `"published"` para verlos.
7. **Publicá**:
   ```bash
   git add .
   git commit -m "Agrega Panadería San Martín"
   git push
   ```
8. Vercel construye y publica automáticamente. Si la validación falla, el despliegue no se realiza y el sitio anterior sigue en línea.

## Campos

| Campo | Obligatorio | Formato / reglas |
| --- | --- | --- |
| `id` | sí | Identificador estable, minúsculas/números/guiones (el asistente genera uno: `neg-xxxxxxxx`). No cambiarlo nunca. |
| `slug` | sí | URL del negocio: `/negocios/<slug>/`. Igual al nombre del archivo. Único. |
| `name` | sí | Nombre comercial (máx. 90). |
| `categoryId` / `subcategoryId` | sí | Deben existir en `src/data/categories.ts` y el subrubro debe pertenecer al rubro. |
| `shortDescription` | sí | Máx. 160 caracteres. Aparece en tarjetas y buscadores. |
| `description` | sí | Máx. 2000. Texto plano (no se admite HTML ni `<` `>`). Los saltos de línea se respetan. |
| `logo`, `coverImage` | no | `/images/...` con extensión webp, avif, png, jpg o svg. El archivo debe existir. |
| `gallery` | no | Hasta 12 imágenes `{ "src", "alt" }`. El `alt` describe la foto. |
| `city`, `province` | sí | `city` debe estar en `siteConfig.location.supportedCities`. |
| `address` | no | Dirección pública del local. |
| `publicPhone` | no | Teléfono comercial, ej. `+54 3873 000000`. Genera el botón “Llamar”. |
| `whatsapp` | no | Solo dígitos con código de país, ej. `5493873000000`. Genera el botón “WhatsApp”. |
| `websiteUrl` | no | `https://...`. Genera el botón principal “Visitar sitio web”. |
| `instagramUrl` / `facebookUrl` | no | `https://` en instagram.com / facebook.com. |
| `mapsUrl` | no | Enlace https de Google Maps (`google.com/maps`, `maps.app.goo.gl`). Genera “Cómo llegar”. |
| `openingHours` | no | Lista de `{ "days": ["mo","tu",...], "opens": "08:00", "closes": "13:00" }`. Días: mo tu we th fr sa su. Para horario cortado, dos entradas. |
| `openingHoursNote` | no | Aclaración libre (ej. “Recepción 24 h”). |
| `features` | no | Servicios o características (máx. 20). |
| `keywords` | no | Palabras extra para el buscador (sinónimos, sin acentos está bien). |
| `attributes` | no | Campos contextuales del rubro (ver abajo). |
| `featured` | no | `true` para mostrarlo en “Destacados” del inicio. |
| `publishedAt` / `updatedAt` | sí | `AAAA-MM-DD`. `updatedAt` ≥ `publishedAt`. Definen el orden “más recientes”. |
| `status` | sí | `draft` (no se publica), `published` (visible) o `archived` (retirado, se conserva el historial). |
| `demo` | no | Solo para registros ficticios. Dejar en `false`. |

## Campos contextuales (`attributes`)

Cada rubro admite campos propios que se muestran en la sección “Información del rubro”. Ejemplos:

| Rubro | Campos |
| --- | --- |
| Salud y bienestar | `specialty` (texto), `services` (lista), `healthInsurance` (lista), `appointmentUrl` (enlace “Solicitar turno”). Farmacias además: `dutyInfoUrl` |
| Gastronomía | `cuisine`, `services`, `menuUrl` |
| Comercios y compras | `productTypes`, `brands`, `services`, `catalogUrl` |
| Construcción y hogar | `specialties`, `brands`, `services`, `catalogUrl` |
| Hotelería y turismo | `accommodationType`, `services`, `bookingUrl` |
| Automotores | `specialties`, `brands`, `services` |
| Servicios profesionales | `practiceArea`, `services`, `appointmentUrl` |
| Belleza | `services`, `appointmentUrl` |
| Deportes | `activities`, `services`, `enrollmentUrl` |
| Educación | `courses`, `modality`, `enrollmentUrl` |
| Emprendimientos | `productTypes`, `shipping`, `catalogUrl` |
| Otros servicios | `services`, `coverageArea` |

La lista exacta está en `src/data/categories.ts`; el asistente `business:new` la muestra al terminar.
Un campo no admitido para el rubro produce un error de validación.

> **Farmacias de turno**: usar `dutyInfoUrl` solo si existe una fuente oficial y vigente que se mantenga actualizada.
> El portal no calcula ni publica guardias.

## Imágenes

- Preferir **WebP** o **AVIF**, 1200×675 para portadas y 512×512 para logos, < 200 KB cada una.
- Usar fotos propias del negocio o con permiso de uso.
- Nombres en minúsculas y sin espacios: `portada.webp`, `logo.webp`, `foto-1.webp`.

## Retirar o modificar un negocio

- **Modificar**: editar el archivo, actualizar `updatedAt`, validar, commit y push.
- **Retirar**: cambiar `status` a `"archived"` (recomendado, conserva historial) o borrar el archivo.
  Si se borra, también borrar sus imágenes.
- **Cambiar el slug**: rompe enlaces compartidos. Evitarlo si el negocio ya fue difundido.

## Errores frecuentes

| Mensaje | Solución |
| --- | --- |
| `slug duplicado` / `id duplicado` | Elegir otro slug / no copiar el id de otro archivo. |
| `subcategoryId ... no pertenece` | Revisar el subrubro en `categories.ts`. |
| `websiteUrl: URL inválida` | Debe empezar con `https://`. |
| `Imagen faltante` | Verificar la ruta y que el archivo esté en `public/`. |
| `El archivo debe llamarse ...` | Renombrar el archivo igual que el slug. |
| `Unrecognized key` | Hay un campo mal escrito (por ejemplo `webiste`). |
