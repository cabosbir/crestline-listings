import { build } from 'vite';
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

await build({
  ssr: { noExternal: ['react-helmet-async', 'gsap'] },
  build: {
    ssr: 'src/homepage-prerender.tsx',
    outDir: 'dist-ssr',
    copyPublicDir: false,
    rollupOptions: { output: { entryFileNames: 'homepage.mjs' } },
  },
});

const { renderHomepage } = await import(pathToFileURL(resolve('dist-ssr/homepage.mjs')));
const { html, head } = renderHomepage();
const shell = await readFile('dist/index.html', 'utf8');
assert(shell.includes('<div id="root"></div>'), 'Expected an empty SPA shell');
assert(html.includes('Search Cabo MLS'), 'The primary MLS link must be readable');
assert(html.includes('full active public MLS BCS inventory without signing up'), 'MLS coverage must be readable');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Expected one homepage heading');

// Only replace metadata owned by the same Helmet instance; preserve everything else.
const metaKeys = new Set([...head.meta.toString().matchAll(/(?:name|property)="([^"]+)"/g)].map(match => match[1]));
let home = shell.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '')
  .replace(/<meta\b[^>]*>/gi, tag => {
    const key = tag.match(/(?:name|property)="([^"]+)"/)?.[1];
    return metaKeys.has(key) ? '' : tag;
  })
  .replace('</head>', `${head.title.toString()}${head.meta.toString()}${head.link.toString()}</head>`)
  .replace('<div id="root"></div>', `<div id="root" data-prerendered="homepage">${html}</div>`);

// Deliver the existing homepage styles with its HTML. Slow mobile connections
// should not have to complete four stylesheet requests before painting the hero.
// Keep the separate SPA shell and every standalone MLS/guide page unchanged.
const fontStyles = await readFile('src/styles/homepage-fonts.css', 'utf8');
for (const match of [...home.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)]) {
  const href = match[0].match(/href="([^"]+)"/)?.[1];
  let css;
  if (href?.startsWith('https://fonts.googleapis.com/')) {
    css = fontStyles;
  } else if (href?.startsWith('/') && !href.startsWith('//')) {
    css = await readFile(resolve('dist', '.' + href.split('?')[0]), 'utf8');
  } else {
    continue;
  }
  assert(!/<\/style/i.test(css), 'Stylesheet must be safe to inline');
  home = home.replace(match[0], `<style data-homepage-styles="${href.replaceAll('&', '&amp;')}">${css}</style>`);
}
const heroPath = html.match(/<img\b[^>]*src="([^"]+)"[^>]*fetchpriority="high"/i)?.[1];
assert(heroPath?.startsWith('/assets/'), 'Expected a compiled homepage hero');
home = home.replace('<head>', `<head>\n<link rel="preload" as="image" href="${heroPath}" fetchpriority="high">`);

assert.equal((home.match(/rel="canonical"/g) || []).length, 1);
assert(home.includes('href="https://www.bircabo.com/"'));
// Check compiled asset paths, not Vite's development-only source paths.
assert(!home.includes('/src/assets/'));
for (const match of home.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) {
  await access(resolve('dist', '.' + match[1]));
}
// Vercel serves the existing root index before fallback rewrites. Put the
// readable homepage there and keep a separate shell for other React routes.
await writeFile('dist/spa.html', shell);
await writeFile('dist/index.html', home);
assert.equal(await readFile('dist/spa.html', 'utf8'), shell);
console.log(`Homepage pre-rendered: ${Buffer.byteLength(home)} bytes, one canonical, MLS links present.`);
