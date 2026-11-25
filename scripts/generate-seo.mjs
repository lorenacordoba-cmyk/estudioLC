import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'https://lorenacordobaabogada.com.ar';
const pages = JSON.parse(await readFile(new URL('../seo/site-pages.json', import.meta.url), 'utf8'));
const outputDir = fileURLToPath(new URL('../dist/amp-salud-lc/browser/', import.meta.url));
const mainHtml = await readFile(join(outputDir, 'index.html'), 'utf8');

function escapeHtml(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
function replaceMeta(html, kind, name, value) {
  const attr = kind === 'property' ? 'property' : 'name';
  const expression = new RegExp(`<meta\\s+${attr}="${name}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
  const tag = `<meta ${attr}="${name}" content="${escapeHtml(value)}">`;
  if (!expression.test(html)) throw new Error(`Falta meta ${name} en el index.html generado`);
  return html.replace(expression, tag);
}
let count = 0;
for (const [route, config] of Object.entries(pages)) {
  const canonical = `${origin}${route}`;
  let html = mainHtml.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(config.title)}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`);
  html = replaceMeta(html, 'name', 'description', config.description);
  html = replaceMeta(html, 'property', 'og:title', config.title);
  html = replaceMeta(html, 'property', 'og:description', config.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'name', 'twitter:title', config.title);
  html = replaceMeta(html, 'name', 'twitter:description', config.description);

  const output = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  const filePath = join(outputDir, output);
  await mkdir(dirname(filePath), {recursive: true});
  await writeFile(filePath, html, 'utf8');
  count++;
}
console.log(`SEO: ${count} HTML con metadatos por ruta creados en dist/amp-salud-lc/browser.`);
