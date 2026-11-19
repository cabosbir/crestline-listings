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
  .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

assert.equal((home.match(/rel="canonical"/g) || []).length, 1);
assert(home.includes('href="https://www.bircabo.com/"'));
// Check compiled asset paths, not Vite's development-only source paths.
assert(!home.includes('/src/assets/'));
for (const match of home.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) {
  await access(resolve('dist', '.' + match[1]));
}
await writeFile('dist/home.html', home);
// Other React routes keep their own blank shell and page-specific metadata.
assert.equal(await readFile('dist/index.html', 'utf8'), shell);
console.log(`Homepage pre-rendered: ${Buffer.byteLength(home)} bytes, one canonical, MLS links present.`);
