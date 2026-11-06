# SEO de lorenacordobaabogada.com.ar

## Qué se implementó
- Metadatos por ruta: título, descripción, Open Graph y canonical.
- Metadatos correctos en la respuesta HTML inicial de Cloudflare Pages: `npm run build` genera páginas `.html` para rutas públicas y mantiene el funcionamiento SPA de Angular.
- `public/robots.txt` y `public/sitemap.xml`, copiados automáticamente a la salida de build.
- Datos estructurados de WebSite, Organization y Person (sin inventar domicilio físico, matrícula, reseñas ni horarios).
- Referencia natural a “Lorena Córdoba, abogada” en el contenido visible de la página principal.
- Un servicio Angular para actualizar metadatos al navegar sin recargar la página.

## Cómo publicar (manteniendo configuración de producción)
Este ZIP mantiene valores de ejemplo de `src/environments/environment.prod.ts`. **No lo reemplace en su repositorio de producción**; conserve la URL real de Cloud Run y la Site Key pública de Turnstile. Para evitar riesgos, use el ZIP parche SEO, que no incluye el archivo de entornos.

1. Copie los archivos del parche a su repositorio Angular (respetando carpetas).
2. Ejecute `npm run build` (Cloudflare Pages utiliza este comando).
3. Compruebe que existen `dist/amp-salud-lc/browser/index.html`, `contacto.html`, `especialidades/amparos-de-salud.html`, `robots.txt` y `sitemap.xml`.
4. Haga commit y push a `main`, y verifique el nuevo despliegue en Cloudflare Pages.
5. Abra `https://lorenacordobaabogada.com.ar/robots.txt` y `https://lorenacordobaabogada.com.ar/sitemap.xml`. Compruebe también la respuesta de `/contacto` y las especialidades.

## Google Search Console (manual, sin costo)
1. Abra https://search.google.com/search-console/ e inicie sesión en su cuenta Google.
2. Añada una propiedad **Dominio**: `lorenacordobaabogada.com.ar` (sin `https://`, sin `www`).
3. Copie el valor TXT que entregue Google. En Cloudflare > Domains > lorenacordobaabogada.com.ar > DNS > Records, cree un registro **TXT** con Name `@` y Content exactamente el valor de Google.
4. Regrese a Search Console y pulse Verificar. Deje ese TXT instalado.
5. Menú Sitemaps > ingrese `sitemap.xml` y envíelo.
6. Herramienta Inspección de URL > `https://lorenacordobaabogada.com.ar/` > Probar URL publicada > Solicitar indexación. Repita con páginas prioritarias si es necesario.
7. Compruebe durante las próximas semanas los informes Páginas y Rendimiento; la indexación o posición no están garantizadas.

## Verificación SEO
- Busque `site:lorenacordobaabogada.com.ar` en Google (orientativo, no reemplaza Search Console).
- Pruebe “Lorena Córdoba abogada” y “Lorena Córdoba estudio jurídico” periódicamente desde una ventana privada; los resultados varían por ubicación y perfil.
- Si corresponde por elegibilidad, complete una ficha de Google Business Profile con información real y coherente con la web.

## Notas técnicas
- No se agrega `404.html`, para conservar el fallback SPA de Cloudflare Pages.
- Las rutas `.html` se sirven como rutas limpias sin extensión en Cloudflare Pages; `/contacto.html` redirige a `/contacto`.
- No modifica Turnstile, la API, los correos ni la estética.
- Si en el futuro se agregan nuevas especialidades/rutas, actualice `seo/site-pages.json` y `public/sitemap.xml`.
