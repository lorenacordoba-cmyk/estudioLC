# Estudio Jurídico — Angular (Cloudflare Pages)

Frontend Angular 22, preparado para **Cloudflare Pages** conectado a GitHub.
El backend Node.js/Fastify se despliega por separado en Google Cloud Run.

## Configuración en Cloudflare Pages

En **Workers & Pages → estudioic → Settings → Build configuration**:

| Campo | Valor |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` (package.json está en la raíz del repositorio) |
| Build command | `npm run build` |
| Build output directory | `dist/amp-salud-lc/browser` |
| Node.js | `22.22.3` o superior, compatible con Angular 22 |

El proyecto **no usa un archivo Wrangler**: la configuración de Pages se administra desde el dashboard. No selecciones el deploy de Workers ni `npx wrangler deploy`.

Las rutas SPA se resuelven automáticamente mediante Cloudflare Pages cuando no hay un archivo `404.html` en la raíz publicada. No se necesita `_redirects`.

## Desarrollo local

```bash
nvm use
npm ci
npm start
```

## Antes de activar el formulario en producción

En `src/environments/environment.prod.ts` permanecen estos valores **pendientes**:

- `apiUrl`: reemplazar `https://TU_BACKEND_PUBLICO.com` por la URL real de Cloud Run.
- `turnstileSiteKey`: reemplazar `REEMPLAZAR_CON_TURNSTILE_SITE_KEY` por la clave pública de Cloudflare Turnstile.

No se sustituyeron porque todavía no conocemos esos valores. La clave secreta de Turnstile y las credenciales del backend **no** van en Angular ni en GitHub.

## Publicar

1. Copiar los archivos del ZIP a la **raíz** del repositorio GitHub (sin crear una carpeta `angular`).
2. Realizar commit y push sobre `main`.
3. Comprobar los valores de Build configuration anteriores.
4. Ejecutar un nuevo deploy (desde el commit nuevo) y comprobar la URL `*.pages.dev`.
5. Cuando Cloud Run y Turnstile estén listos, completar `environment.prod.ts` y volver a publicar.

## Comprobaciones técnicas

El directorio final debe contener directamente `index.html` y archivos `.js`/`.css`. La carpeta `dist` se genera al compilar y no debe subirse a GitHub.
