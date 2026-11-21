# Publicación en GitHub y Vercel

TARTAGAL GO se publica como **sitio estático** (`out/`). Vercel ejecuta `npm ci` y `npm run build`, y sirve la carpeta `out/`
con las cabeceras de `vercel.json`. No hay servidor de aplicación, funciones ni base de datos.

## 1. Crear el repositorio en GitHub

```bash
git init -b main          # si todavía no es un repositorio
git add .
git commit -m "TARTAGAL GO: versión inicial"
```

En GitHub: **New repository** → nombre `tartagal-go` → **Private** (recomendado) → sin README.

```bash
git remote add origin https://github.com/<usuario>/tartagal-go.git
git push -u origin main
```

### Protección recomendada del repositorio

En **Settings** del repositorio:

1. **Branches → Add branch ruleset** para `main`:
   - Require a pull request before merging (con 1 aprobación si hay más de una persona).
   - Require status checks to pass: `Lint, tipos, catálogo, pruebas y build` y `Análisis estático (CodeQL)`.
   - Block force pushes y restrict deletions.
2. **Code security**: activar *Dependency graph*, *Dependabot alerts*, *Dependabot security updates*,
   *Secret scanning* y *Push protection*.
3. **Actions → General**: *Workflow permissions* = **Read repository contents** (los workflows ya declaran permisos mínimos).
   *Fork pull request workflows*: requerir aprobación para colaboradores externos.
4. Activar **2FA** en la cuenta de GitHub.

## 2. Ejecutar localmente

```bash
npm ci
npm run dev                    # desarrollo
npm run verify                 # lint + typecheck + unit + build
npx playwright install chromium
npm run test:e2e               # E2E sobre out/
npm start                      # ver el build estático con cabeceras
```

## 3. Subir cambios

```bash
git checkout -b agrega-panaderia     # opcional, recomendado si hay protección de rama
git add .
git commit -m "Agrega Panadería San Martín"
git push
```

Con rama: abrir un Pull Request; la CI debe pasar antes de fusionar. Vercel crea una **vista previa** para cada PR.

## 4. Conectar Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importar el repositorio de GitHub.
2. **Framework Preset**: dejar el que detecte; `vercel.json` fija `"framework": null`, `buildCommand`,
   `installCommand` y `outputDirectory: "out"`, por lo que se despliega como sitio estático.
3. **Node.js Version** (Settings → General): 22.x.
4. Definir las variables de entorno (paso 6) y **Deploy**.

## 5. Dominio

1. Vercel → Project → **Settings → Domains** → agregar `tudominio.com.ar` y `www.tudominio.com.ar`.
2. En el proveedor DNS (NIC Argentina delega en el DNS que elijas) crear los registros que indica Vercel
   (normalmente `A` para el dominio raíz y `CNAME` para `www`).
3. Elegir un dominio principal y redirigir el otro.
4. Vercel emite el certificado HTTPS automáticamente.
5. Actualizar `NEXT_PUBLIC_SITE_URL` con el dominio definitivo y volver a desplegar.

## 6. Variables públicas

Vercel → **Settings → Environment Variables** (entorno *Production* y, si se quiere, *Preview*):

| Variable | Ejemplo | Notas |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.tartagalgo.com.ar` | Recomendada. Si falta, se usa el dominio de producción de Vercel (`VERCEL_PROJECT_PRODUCTION_URL`, ej. `tgterminado.vercel.app`) con una advertencia. Definirla al tener dominio propio. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hola@tudominio.com.ar` | Opcional. Si falta, se muestra “configuración pendiente”. |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | `5493873000000` | Opcional. Solo dígitos. |
| `NEXT_PUBLIC_SHOW_DEMO_BUSINESSES` | `false` | Poner `false` cuando haya negocios reales. |

Son valores **públicos**: quedan en el HTML/JS. Cualquier cambio requiere un nuevo despliegue (Deployments → Redeploy).

## 7. Verificar las cabeceras de seguridad

```bash
curl -sI https://www.tudominio.com.ar/ | grep -iE "content-security|x-content-type|referrer|permissions|strict-transport|x-frame"
```

Verificar además:

- En el HTML (Ver código fuente) existe `<meta http-equiv="Content-Security-Policy" ...>` con `script-src 'self' 'sha256-...'`.
- La consola del navegador (F12) no muestra errores “Refused to …” al navegar, buscar y guardar favoritos.
- Herramientas externas: [securityheaders.com](https://securityheaders.com) y [Mozilla Observatory](https://observatory.mozilla.org).
- Lighthouse (Chrome DevTools → Lighthouse → Mobile) sobre `/`, `/explorar/` y una ficha de negocio.

## 8. Publicar nuevos negocios

Ver [ADDING_BUSINESSES.md](ADDING_BUSINESSES.md). En resumen: crear el JSON, `npm run catalog:validate`, commit y push.

## 9. Revertir un despliegue

- **Inmediato**: Vercel → Project → **Deployments** → elegir el último despliegue correcto → **⋯ → Promote to Production**
  (o *Instant Rollback*). No requiere tocar el código.
- **En el repositorio** (para que el próximo push no reintroduzca el problema):
  ```bash
  git revert <sha-del-commit>
  git push
  ```

## Qué depende de servicios externos

| Control | Depende de |
| --- | --- |
| HTTPS y certificado | Vercel + configuración DNS |
| Cabeceras HTTP (CSP de cabecera, HSTS, etc.) | Vercel aplicando `vercel.json` |
| Protección ante DDoS y abuso de tráfico | Infraestructura de Vercel (no del código) |
| Protección de la rama, revisiones, alertas | Configuración de GitHub |
| Seguridad de la cuenta | 2FA en GitHub, Vercel y el registrador del dominio |
