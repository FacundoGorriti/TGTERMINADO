# Mantenimiento

## Rutina sugerida

| Frecuencia | Tarea |
| --- | --- |
| Cada alta o cambio | `npm run catalog:validate` antes del commit. Revisar la ficha en el celular. |
| Semanal | Revisar los PR de Dependabot: si la CI pasa, fusionar los de *patch/minor*. |
| Mensual | Revisar alertas de seguridad (GitHub → Security). Verificar que los enlaces de los negocios sigan funcionando. |
| Trimestral | Pedir a cada negocio que confirme horarios y contacto; actualizar `updatedAt`. Revisar Lighthouse en producción. |
| Anual | Revisar textos legales, el dominio (vencimiento en NIC Argentina) y las versiones mayores de Next/React. |

## Actualizar dependencias

```bash
npm outdated                 # ver qué hay disponible
npm update                   # dentro de los rangos del package.json (versiones exactas: no cambia nada)
npm install next@<versión> --save-exact     # actualizar una dependencia puntual
npm run verify && npm run test:e2e          # comprobar antes de publicar
```

Para versiones **mayores** (por ejemplo Next 17): leer la guía de migración oficial, actualizar en una rama, correr toda la verificación
y revisar el sitio con `npm start` antes de fusionar.

Después de actualizar Next.js, comprobar especialmente:

- Que `scripts/postbuild-rsc-paths.mjs` siga siendo necesario (si Next deja de crear carpetas `__next.*`, el script no hace nada).
- Que la CSP siga sin errores en consola (`npm run test:e2e` lo verifica).

## Backups

- **El repositorio es el backup**: todo el contenido (código, catálogo, imágenes) está versionado en GitHub.
- Mantener al menos una copia adicional: clonar el repositorio en otra computadora o usar `git clone --mirror` periódicamente:
  ```bash
  git clone --mirror https://github.com/<usuario>/tartagal-go.git tartagal-go-backup.git
  cd tartagal-go-backup.git && git remote update     # para actualizarlo más adelante
  ```
- Las variables de entorno de Vercel no están en el repositorio: anotarlas en un lugar seguro (no son secretas, pero sí necesarias).
- Vercel conserva los despliegues anteriores: se puede volver a cualquiera desde *Deployments*.

## Limpieza de datos de demostración

Cuando haya negocios reales:

```bash
rm src/data/businesses/*-demo-*.json src/data/businesses/*-ejemplo-*.json
rm -r public/images/demo
```

y/o `NEXT_PUBLIC_SHOW_DEMO_BUSINESSES=false` en Vercel. Luego `npm run verify`.
Algunas pruebas E2E usan los negocios de demostración: al quitarlos, adaptar `tests/e2e/*.spec.ts` a negocios reales.

## Regenerar íconos e imagen Open Graph

Si cambia el isotipo (`public/branding/isotipo.svg` y `src/app/icon.svg`):

```bash
npx playwright install chromium
node scripts/generate-brand-assets.mjs
```

## Problemas frecuentes

| Síntoma | Causa probable |
| --- | --- |
| El build falla en Vercel con “Catálogo inválido” | Error en un JSON: correr `npm run catalog:validate` localmente. |
| “NEXT_PUBLIC_SITE_URL no está configurada” | Falta la variable y Vercel no informó un dominio de producción: definirla en Vercel (Production). |
| Un negocio no aparece | `status` distinto de `published`, o es `demo` con demos desactivados. |
| Cambié una variable y no se refleja | Las variables se incrustan en el build: hacer *Redeploy*. |
| Errores “Refused to execute inline script” | Un script inline nuevo sin hash: revisar que el build ejecute `postbuild-csp.mjs`. |
