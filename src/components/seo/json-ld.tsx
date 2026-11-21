/**
 * Datos estructurados Schema.org.
 *
 * ÚNICO uso de `dangerouslySetInnerHTML` del proyecto (documentado en docs/SECURITY.md):
 * - El contenido es un objeto generado por el propio código, serializado con JSON.stringify.
 * - Se escapan `<`, `>` y `&`, por lo que un texto del catálogo
 *   no puede cerrar la etiqueta </script> ni inyectar HTML.
 * - `type="application/ld+json"` es un bloque de datos: el navegador no lo ejecuta.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
